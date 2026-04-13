import asyncio
import json
import logging
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.database import Conversation, Message, get_session, async_session
from app.services.deepseek_service import stream_chat, generate_title

logger = logging.getLogger(__name__)
router = APIRouter()


class ChatRequest(BaseModel):
    conversation_id: str
    message: str
    thinking_enabled: bool = False


@router.post("/api/chat")
async def chat(
    request: ChatRequest,
    session: AsyncSession = Depends(get_session),
):
    conv = await session.get(Conversation, request.conversation_id)
    if not conv:
        return {"error": "Conversation not found"}, 404

    user_msg = Message(
        id=str(uuid.uuid4()),
        conversation_id=request.conversation_id,
        role="user",
        content=request.message,
        created_at=datetime.now(timezone.utc),
    )
    session.add(user_msg)
    conv.updated_at = datetime.now(timezone.utc)
    await session.commit()

    result = await session.execute(
        select(Message)
        .where(Message.conversation_id == request.conversation_id)
        .order_by(Message.created_at)
    )
    history = result.scalars().all()

    api_messages = [{"role": msg.role, "content": msg.content} for msg in history]

    assistant_msg_id = str(uuid.uuid4())

    count_result = await session.execute(
        select(func.count(Message.id)).where(
            Message.conversation_id == request.conversation_id,
            Message.role == "user",
        )
    )
    user_msg_count = count_result.scalar()

    conversation_id = request.conversation_id
    thinking_enabled = request.thinking_enabled
    first_message = request.message

    async def generate():
        reasoning_content = ""
        content = ""

        try:
            async for event in stream_chat(api_messages, thinking_enabled=thinking_enabled):
                if event["type"] == "reasoning":
                    reasoning_content += event["content"]
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                elif event["type"] == "content":
                    content += event["content"]
                    yield f"data: {json.dumps(event, ensure_ascii=False)}\n\n"
                elif event["type"] == "done":
                    pass
        except Exception as e:
            logger.exception("Stream error")
            yield f"data: {json.dumps({'type': 'error', 'message': str(e)}, ensure_ascii=False)}\n\n"
            yield "data: [DONE]\n\n"
            return

        # Save assistant message
        try:
            async with async_session() as save_session:
                assistant_msg = Message(
                    id=assistant_msg_id,
                    conversation_id=conversation_id,
                    role="assistant",
                    content=content,
                    reasoning_content=reasoning_content if reasoning_content else None,
                    model="deepseek-chat",
                    created_at=datetime.now(timezone.utc),
                )
                save_session.add(assistant_msg)

                conv_obj = await save_session.get(Conversation, conversation_id)
                if conv_obj:
                    conv_obj.updated_at = datetime.now(timezone.utc)

                await save_session.commit()
        except Exception:
            logger.exception("Failed to save assistant message")

        yield f"data: {json.dumps({'type': 'done', 'message_id': assistant_msg_id}, ensure_ascii=False)}\n\n"
        yield "data: [DONE]\n\n"

        if user_msg_count == 1:
            asyncio.create_task(_generate_title(conversation_id, first_message))

    return StreamingResponse(generate(), media_type="text/event-stream")


async def _generate_title(conversation_id: str, first_message: str):
    try:
        title = await generate_title(first_message)
        async with async_session() as session:
            conv = await session.get(Conversation, conversation_id)
            if conv:
                conv.title = title
                await session.commit()
    except Exception:
        logger.exception("Failed to generate title")
