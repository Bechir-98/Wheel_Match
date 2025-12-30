from pydantic import BaseModel
from typing import List, Optional


class ChatMessage(BaseModel):
    role: str
    text: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []