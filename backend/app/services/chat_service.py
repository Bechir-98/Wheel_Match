import json
import os
from typing import AsyncGenerator, List

from google import genai
from google.genai import types

from app.core.config import settings
from app.db.session import SessionLocal
from app.models import KBChunk
from app.schemas.chat import ChatMessage

EMBEDDING_MODEL = "gemini-embedding-001"
CHAT_MODEL = "gemini-2.5-flash"
TOP_K = 5


def get_gemini_api_key() -> str:
    return getattr(settings, 'gemini_api_key', None) or os.getenv("GEMINI_API_KEY", "")


def embed_text(text: str) -> List[float]:
    api_key = get_gemini_api_key()
    if not api_key:
        raise ValueError("GEMINI_API_KEY not configured")
    client = genai.Client(api_key=api_key)
    result = client.models.embed_content(
        model=EMBEDDING_MODEL,
        contents=text,
        config=types.EmbedContentConfig(task_type="RETRIEVAL_QUERY")
    )
    return result.embeddings[0].values


def retrieve_relevant_chunks(query: str, top_k: int = TOP_K) -> List[dict]:
    # ponytail: exact cosine scan via pgvector, HNSW index when chunks reach thousands
    query_embedding = embed_text(query)
    db = SessionLocal()
    try:
        rows = (
            db.query(KBChunk)
            .order_by(KBChunk.EMBEDDING.cosine_distance(query_embedding))
            .limit(top_k)
            .all()
        )
        return [{"id": r.ID, "text": r.TEXT, "type": r.TYPE, "metadata": r.METADATA} for r in rows]
    finally:
        db.close()


def format_history(history: List[ChatMessage]) -> List[dict]:
    formatted = []
    for msg in history:
        role = "user" if msg.role == "user" else "model"
        formatted.append({"role": role, "parts": [msg.text]})
    return formatted


def build_system_prompt(context_chunks: List[dict]) -> str:
    context_text = "\n\n".join([chunk["text"] for chunk in context_chunks])
    return f"""You are Wheel Match's AI assistant. Answer questions about wheelchairs, medical conditions, and the app.
Use the context below to answer accurately. Be concise, helpful, and friendly.
If you don't know something, say so honestly.

Context:
{context_text}"""


async def stream_chat_response(message: str, history: List[ChatMessage]) -> AsyncGenerator[str, None]:
    api_key = get_gemini_api_key()
    if not api_key:
        yield f"data: {json.dumps({'text': 'Error: GEMINI_API_KEY not configured'})}\n\n"
        yield "data: [DONE]\n\n"
        return

    try:
        context_chunks = retrieve_relevant_chunks(message)
    except Exception as e:
        print(f"RAG retrieval failed, continuing without context: {e}")
        context_chunks = []
    system_prompt = build_system_prompt(context_chunks)

    client = genai.Client(api_key=api_key)
    chat = client.chats.create(
        model=CHAT_MODEL,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt
        )
    )

    try:
        response = chat.send_message_stream(message)
        for chunk in response:
            if chunk.text:
                yield f"data: {json.dumps({'text': chunk.text})}\n\n"
    except Exception as e:
        yield f"data: {json.dumps({'text': f'Error: {str(e)}'})}\n\n"

    yield "data: [DONE]\n\n"