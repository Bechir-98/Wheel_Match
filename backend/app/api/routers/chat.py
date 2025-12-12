from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.chat import ChatRequest, ChatMessage
from app.services.chat_service import stream_chat_response
from app.services.kb_builder import rebuild_knowledge_base

router = APIRouter(tags=["chat"])


@router.post("")
async def chat(request: ChatRequest):
    return StreamingResponse(
        stream_chat_response(request.message, request.history or []),
        media_type="text/event-stream"
    )


@router.post("/rebuild-kb")
async def rebuild_kb(db: Session = Depends(get_db)):
    rebuild_knowledge_base()
    return {"status": "ok", "message": "Knowledge base rebuilt successfully"}


@router.get("/health")
async def health():
    return {"status": "ok", "service": "chat"}