const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:8000";

export async function sendPrompt(prompt: string): Promise<string> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.detail ?? "Failed to get a response");
  }

  const data: { response: string } = await response.json();
  return data.response;
}
