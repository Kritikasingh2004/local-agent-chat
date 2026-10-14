import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

app = FastAPI()

OLLAMA_URL = "http://localhost:11434/api/chat"
MODEL = "qwen3.5:4b"


class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    response: str


@app.get("/")
def read_root():
    return {"Message": "Local LLM API is running gng"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        async with httpx.AsyncClient(timeout=180.0) as client:
            result = await client.post(
                OLLAMA_URL,
                json={
                    "model": MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": request.prompt,
                        }
                    ],
                    "think": False,
                    "stream": False,
                },
            )

            result.raise_for_status()
            data = result.json()

        return ChatResponse(response=data["message"]["content"])

    except httpx.HTTPStatusError as exc:
        raise HTTPException(
            status_code=502,
            detail=f"Ollama returned an error: {exc.response.text}",
        ) from exc

    except httpx.RequestError as exc:
        raise HTTPException(
            status_code=503,
            detail="Cannot connect to Ollama. Is Ollama running?",
        ) from exc
