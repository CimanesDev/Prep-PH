// Safe client-side utility using a runtime env provided by Vite.
// IMPORTANT: This still exposes your key to the browser during local dev.
// Only use VITE_GEMINI_API_KEY for quick local tests; for production,
// move calls behind a serverless function and remove the key from client.

// Prefer latest flash model
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

export type ChatMessage = { role: "user" | "model"; text: string };

export async function aiGenerate(prompt: string, history: ChatMessage[] = []): Promise<string> {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
  if (!apiKey) throw new Error("Missing VITE_GEMINI_API_KEY");

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        ...history.map((m) => ({ role: m.role, parts: [{ text: m.text }]})),
        { role: "user", parts: [{ text: prompt }] }
      ]
    })
  });

  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}


