from typing import Optional
from pydantic import BaseModel, Field


class MessageSend(BaseModel):
    conv_id: Optional[int] = None
    other_id: Optional[int] = None
    demande_id: Optional[int] = None
    text: str = Field(min_length=1, max_length=2000)


class MessageOut(BaseModel):
    id: int
    conv_id: int
    sender_id: int
    text: str
    is_read: bool
    created_at: Optional[str] = None


class ThreadOut(BaseModel):
    id: int
    other_id: int
    other_name: str
    other_role: str
    demande_id: Optional[int] = None
    last_text: str = ""
    unread: int = 0
    updated_at: Optional[str] = None
