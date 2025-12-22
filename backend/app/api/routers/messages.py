"""1:1 user messaging (patient<->vendor). Polling, no websockets."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user_with_role, get_db
from app.models import Conversation, DemandeFauteuil, Message, Utilisateur
from app.schemas.messages import MessageOut, MessageSend, ThreadOut
from app.services.auth_service import resolve_role
from app.services.messaging import display_name, my_conversations, valid_pair

router = APIRouter()


def _require_member(db: Session, conv_id: int, user_id: int) -> Conversation:
    conv = db.query(Conversation).filter(Conversation.ID == conv_id).first()
    if not conv or user_id not in (conv.PATIENT_ID, conv.OTHER_ID):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Thread not found")
    return conv


def _thread_out(db: Session, conv: Conversation, me: int) -> ThreadOut:
    other = conv.OTHER_ID if conv.PATIENT_ID == me else conv.PATIENT_ID
    last = (
        db.query(Message)
        .filter(Message.CONV_ID == conv.ID)
        .order_by(Message.ID.desc())
        .first()
    )
    unread = (
        db.query(Message)
        .filter(
            Message.CONV_ID == conv.ID,
            Message.SENDER_ID != me,
            Message.IS_READ == False,  # noqa: E712
        )
        .count()
    )
    return ThreadOut(
        id=conv.ID,
        other_id=other,
        other_name=display_name(db, other),
        other_role=resolve_role(db, other) or "user",
        demande_id=conv.DEMANDE_ID,
        last_text=last.TEXT if last else "",
        unread=unread,
        updated_at=conv.UPDATED_AT.isoformat() if conv.UPDATED_AT else None,
    )


@router.get("/threads", response_model=list[ThreadOut])
def list_threads(
    db: Session = Depends(get_db),
    ctx=Depends(get_current_user_with_role),
):
    user, _ = ctx
    return [_thread_out(db, c, user.ID_UTILISATUER) for c in my_conversations(db, user.ID_UTILISATUER)]


@router.get("/threads/{conv_id}", response_model=list[MessageOut])
def read_thread(
    conv_id: int,
    db: Session = Depends(get_db),
    ctx=Depends(get_current_user_with_role),
):
    user, _ = ctx
    conv = _require_member(db, conv_id, user.ID_UTILISATUER)
    db.query(Message).filter(
        Message.CONV_ID == conv.ID,
        Message.SENDER_ID != user.ID_UTILISATUER,
        Message.IS_READ == False,  # noqa: E712
    ).update({Message.IS_READ: True}, synchronize_session=False)
    db.commit()
    rows = db.query(Message).filter(Message.CONV_ID == conv.ID).order_by(Message.ID.asc()).all()
    return [
        MessageOut(
            id=m.ID,
            conv_id=m.CONV_ID,
            sender_id=m.SENDER_ID,
            text=m.TEXT,
            is_read=m.IS_READ,
            created_at=m.CREATED_AT.isoformat() if m.CREATED_AT else None,
        )
        for m in rows
    ]


@router.post("/messages", response_model=MessageOut)
def send_message(
    payload: MessageSend,
    db: Session = Depends(get_db),
    ctx=Depends(get_current_user_with_role),
):
    user, my_role = ctx
    me = user.ID_UTILISATUER
    text = (payload.text or "").strip()
    if not text:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty message")

    if payload.conv_id:
        conv = _require_member(db, payload.conv_id, me)
    else:
        if not payload.other_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="other_id required")
        other = db.query(Utilisateur).filter(Utilisateur.ID_UTILISATUER == payload.other_id).first()
        if not other or payload.other_id == me:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        other_role = resolve_role(db, payload.other_id)
        if not valid_pair(my_role, other_role):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Messaging allowed patient<->vendor only")
        patient_id = me if my_role == "patient" else payload.other_id
        other_id = payload.other_id if my_role == "patient" else me
        demande_id = payload.demande_id
        if demande_id and not db.query(DemandeFauteuil).filter(DemandeFauteuil.ID_DEMANDE == demande_id).first():
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
        conv = (
            db.query(Conversation)
            .filter(
                Conversation.PATIENT_ID == patient_id,
                Conversation.OTHER_ID == other_id,
                Conversation.DEMANDE_ID == demande_id,
            )
            .first()
        )
        if not conv:
            conv = Conversation(PATIENT_ID=patient_id, OTHER_ID=other_id, DEMANDE_ID=demande_id)
            db.add(conv)
            db.flush()

    msg = Message(CONV_ID=conv.ID, SENDER_ID=me, TEXT=text[:2000], IS_READ=False)
    db.add(msg)
    conv.UPDATED_AT = func.now()
    db.commit()
    db.refresh(msg)
    return MessageOut(
        id=msg.ID,
        conv_id=conv.ID,
        sender_id=me,
        text=msg.TEXT,
        is_read=False,
        created_at=msg.CREATED_AT.isoformat() if msg.CREATED_AT else None,
    )


@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    ctx=Depends(get_current_user_with_role),
):
    from app.services.messaging import unread_count

    user, _ = ctx
    return {"unread": unread_count(db, user.ID_UTILISATUER)}
