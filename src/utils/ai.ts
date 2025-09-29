// Safe client-side utility using a runtime env provided by Vite.
// IMPORTANT: This still exposes your key to the browser during local dev.
// Only use VITE_GEMINI_API_KEY for quick local tests; for production,
// move calls behind a serverless function and remove the key from client.

// Prefer configurable model; default to a cost-effective flash model
const MODEL = (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.0-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

export type ChatMessage = { role: "user" | "model"; text: string };

export type AiOptions = {
  model?: string;
  maxOutputTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
  timeoutMs?: number;
};

export async function aiGenerate(prompt: string, history: ChatMessage[] = [], opts: AiOptions = {}): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

  const maxOutputTokens = Number(opts.maxOutputTokens ?? import.meta.env.VITE_GEMINI_MAX_TOKENS ?? 120);
  const temperature = Number(opts.temperature ?? import.meta.env.VITE_GEMINI_TEMPERATURE ?? 0.7);
  const topP = Number(opts.topP ?? import.meta.env.VITE_GEMINI_TOP_P ?? 0.8);
  const topK = Number(opts.topK ?? import.meta.env.VITE_GEMINI_TOP_K ?? 40);

  const model = opts.model || (import.meta.env.VITE_GEMINI_MODEL as string | undefined) || "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(opts.timeoutMs ?? 15000));

  // Retry with exponential backoff for transient errors
  const attempt = async (tryNum: number): Promise<Response> => {
    const res = await fetch(`${url}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [
          ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }]})),
          { role: "user", parts: [{ text: prompt }] }
        ],
        generationConfig: {
          maxOutputTokens,
          temperature,
          topP,
          topK,
          candidateCount: 1
        }
      })
    });
    if (res.status === 429 || res.status >= 500) {
      if (tryNum < 2) {
        const delay = 400 * Math.pow(2, tryNum) + Math.floor(Math.random() * 200);
        await new Promise(r => setTimeout(r, delay));
        return attempt(tryNum + 1);
      }
    }
    return res;
  };

  const res = await attempt(0);
  clearTimeout(timeout);

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}


