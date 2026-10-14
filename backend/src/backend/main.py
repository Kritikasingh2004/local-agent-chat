import json
from pathlib import Path

import httpx
from dotenv import dotenv_values
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

ENV = dotenv_values(Path(__file__).resolve().parents[2] / ".env")
API_URL = ENV.get("API_URL")
MODEL = ENV.get("MODEL")


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    response: str


@app.get("/")
def read_root():
    return {"Message": "Local LLM API is running gng"}


@app.post("/chat")
async def chat(request: ChatRequest):
    if not API_URL or not MODEL:
        raise HTTPException(
            status_code=500,
            detail="API_URL or MODEL is missing from .env",
        )

    async def generate():
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                async with client.stream(
                    "POST",
                    API_URL,
                    json={
                        "model": MODEL,
                        "messages": [
                            {
                                "role": "user",
                                "content": request.prompt,
                            }
                        ],
                        "think": False,
                        "stream": True,
                    },
                ) as result:
                    result.raise_for_status()

                    async for line in result.aiter_lines():
                        if not line:
                            continue

                        data = json.loads(line)

                        # Send the generated text immediately.
                        content = data.get("message", {}).get("content", "")

                        if content:
                            yield (
                                f"data: {json.dumps({'token': content})}\n\n"
                            )

                        # Tell the frontend that generation is complete.
                        if data.get("done", False):
                            yield 'data: {"done": true}\n\n'
                            return

        except httpx.HTTPStatusError as exc:
            error = {
                "error": f"Ollama returned an error: {exc.response.text}"
            }
            yield f"data: {json.dumps(error)}\n\n"

        except (httpx.RequestError, httpx.TimeoutException) as exc:
            error = {
                "error": "Cannot connect to Ollama. Is Ollama running?"
            }
            yield f"data: {json.dumps(error)}\n\n"

        except json.JSONDecodeError:
            yield 'data: {"error": "Invalid response from Ollama"}\n\n'

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        },
    )