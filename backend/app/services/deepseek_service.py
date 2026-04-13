from typing import AsyncGenerator

from openai import AsyncOpenAI

from app.config import settings

client = AsyncOpenAI(
    api_key=settings.deepseek_api_key,
    base_url=settings.deepseek_base_url,
)


async def stream_chat(
    messages: list[dict],
    thinking_enabled: bool = False,
) -> AsyncGenerator[dict, None]:
    """
    Stream chat completion from DeepSeek API.

    Yields dicts with:
      {"type": "reasoning", "content": "..."} — thinking tokens (only when thinking_enabled)
      {"type": "content",   "content": "..."} — reply tokens
    """
    extra_body = {}
    if thinking_enabled:
        extra_body["thinking"] = {"type": "enabled"}

    stream = await client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        stream=True,
        **({"extra_body": extra_body} if extra_body else {}),
    )

    async for chunk in stream:
        if not chunk.choices:
            continue

        delta = chunk.choices[0].delta
        finish_reason = chunk.choices[0].finish_reason

        rc = getattr(delta, "reasoning_content", None)
        if rc:
            yield {"type": "reasoning", "content": rc}

        if delta.content:
            yield {"type": "content", "content": delta.content}

        if finish_reason == "stop":
            usage = chunk.usage
            yield {
                "type": "done",
                "usage": {
                    "prompt_tokens": usage.prompt_tokens,
                    "completion_tokens": usage.completion_tokens,
                    "total_tokens": usage.total_tokens,
                } if usage else None,
            }


async def generate_title(user_message: str) -> str:
    """Generate a short conversation title from the first user message."""
    response = await client.chat.completions.create(
        model="deepseek-chat",
        messages=[
            {
                "role": "system",
                "content": "用10个字以内的中文总结用户消息的主题，只输出标题文字，不要标点符号。",
            },
            {"role": "user", "content": user_message},
        ],
        max_tokens=30,
    )
    return response.choices[0].message.content.strip()
