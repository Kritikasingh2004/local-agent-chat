const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

type StreamEvent = {
  token?: string;
  done?: boolean;
  error?: string;
};

function parseEvent(event: string): StreamEvent | null {
  const data = event
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trimStart())
    .join('\n');

  if (!data) return null;

  try {
    return JSON.parse(data) as StreamEvent;
  } catch {
    throw new Error('The backend sent a malformed streaming event.');
  }
}

export async function* streamPrompt(prompt: string): AsyncGenerator<string> {
  const response = await fetch(`${API_URL}/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let message = 'Failed to get a response';

    try {
      const error = JSON.parse(errorText) as { detail?: string };
      message = error.detail ?? message;
    } catch {
      if (errorText) message = errorText;
    }

    throw new Error(message);
  }

  if (!response.body) {
    throw new Error('The backend returned an empty response stream.');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let receivedDone = false;

  const processEvent = (eventText: string): string | null => {
    const event = parseEvent(eventText);
    if (!event) return null;
    if (event.error) throw new Error(event.error);
    if (event.done) {
      receivedDone = true;
      return null;
    }
    if (typeof event.token !== 'string') {
      throw new Error('The backend sent an invalid streaming event.');
    }
    return event.token;
  };

  try {
    while (!receivedDone) {
      const { value, done } = await reader.read();
      buffer += decoder.decode(value, { stream: !done });

      const events = buffer.split(/\r?\n\r?\n/);
      buffer = events.pop() ?? '';

      for (const eventText of events) {
        const token = processEvent(eventText);
        if (token !== null) yield token;
        if (receivedDone) break;
      }

      if (done) break;
    }

    if (!receivedDone && buffer.trim()) {
      const token = processEvent(buffer);
      if (token !== null) yield token;
    }

    if (!receivedDone) {
      throw new Error('The response stream ended before generation completed.');
    }
  } finally {
    reader.releaseLock();
  }
}
