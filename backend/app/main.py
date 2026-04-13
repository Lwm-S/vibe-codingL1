from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from openai import AuthenticationError, RateLimitError, APIConnectionError

from app.config import settings
from app.models.database import init_db
from app.routers import chat, conversations


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="ChatGPT Clone API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(conversations.router)


# --- Global exception handlers ---

@app.exception_handler(AuthenticationError)
async def auth_error_handler(request: Request, exc: AuthenticationError):
    return JSONResponse(status_code=401, content={"error": "DeepSeek API 认证失败，请检查 API Key"})


@app.exception_handler(RateLimitError)
async def rate_limit_handler(request: Request, exc: RateLimitError):
    return JSONResponse(status_code=429, content={"error": "请求过于频繁，请稍后重试"})


@app.exception_handler(APIConnectionError)
async def connection_error_handler(request: Request, exc: APIConnectionError):
    return JSONResponse(status_code=504, content={"error": "无法连接 DeepSeek API，请检查网络"})


# --- Health check ---

@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "service": "chatgpt-clone-backend",
        "version": "0.1.0",
    }


@app.get("/api/health/deepseek")
async def deepseek_health():
    from openai import AsyncOpenAI
    try:
        client = AsyncOpenAI(
            api_key=settings.deepseek_api_key,
            base_url=settings.deepseek_base_url,
        )
        await client.chat.completions.create(
            model="deepseek-chat",
            messages=[{"role": "user", "content": "hi"}],
            max_tokens=1,
        )
        return {
            "status": "ok",
            "models": ["deepseek-chat"],
            "message": "DeepSeek API connected successfully",
        }
    except Exception as e:
        return {"status": "error", "message": str(e)}
