import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import Conversation, Message, get_session

router = APIRouter()


class CreateConversationRequest(BaseModel):
    model: str = "deepseek-chat"
    thinking_enabled: bool = False


class UpdateConversationRequest(BaseModel):
    title: str


def _conv_to_dict(conv: Conversation) -> dict:
    return {
        "id": conv.id,
        "title": conv.title,
        "model": conv.model,
        "thinking_enabled": conv.thinking_enabled == "true",
        "created_at": conv.created_at.isoformat() if conv.created_at else None,
        "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
    }


def _msg_to_dict(msg: Message) -> dict:
    return {
        "id": msg.id,
        "conversation_id": msg.conversation_id,
        "role": msg.role,
        "content": msg.content,
        "reasoning_content": msg.reasoning_content,
        "model": msg.model,
        "created_at": msg.created_at.isoformat() if msg.created_at else None,
    }


@router.post("/api/conversations")
async def create_conversation(
    request: CreateConversationRequest,
    session: AsyncSession = Depends(get_session),
):
    now = datetime.now(timezone.utc)
    conv = Conversation(
        id=str(uuid.uuid4()),
        title="新对话",
        model=request.model,
        thinking_enabled="true" if request.thinking_enabled else "false",
        created_at=now,
        updated_at=now,
    )
    session.add(conv)
    await session.commit()
    return _conv_to_dict(conv)


@router.get("/api/conversations")
async def list_conversations(
    session: AsyncSession = Depends(get_session),
):
    result = await session.execute(
        select(Conversation).order_by(Conversation.updated_at.desc())
    )
    conversations = result.scalars().all()
    return [_conv_to_dict(c) for c in conversations]


@router.get("/api/conversations/{conversation_id}")
async def get_conversation(
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
):
    conv = await session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = result.scalars().all()

    return {
        **_conv_to_dict(conv),
        "messages": [_msg_to_dict(m) for m in messages],
    }


@router.patch("/api/conversations/{conversation_id}")
async def update_conversation(
    conversation_id: str,
    request: UpdateConversationRequest,
    session: AsyncSession = Depends(get_session),
):
    conv = await session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    conv.title = request.title
    conv.updated_at = datetime.now(timezone.utc)
    await session.commit()
    return _conv_to_dict(conv)


@router.delete("/api/conversations/{conversation_id}")
async def delete_conversation(
    conversation_id: str,
    session: AsyncSession = Depends(get_session),
):
    conv = await session.get(Conversation, conversation_id)
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    await session.delete(conv)
    await session.commit()
    return {"status": "ok"}
