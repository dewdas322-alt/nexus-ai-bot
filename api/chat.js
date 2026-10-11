export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { model, messages, temperature } = await req.json();
    const apiKey = process.env.OPENROUTER_API_KEY; // Vercel se secret key uthayega

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API Key missing on server environment' }), { status: 500 });
    }

    const openrouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://vercel.com",
        "X-Title": "NEXUS AI Studio"
      },
      body: JSON.stringify({
        model: model || "anthropic/claude-3.5-sonnet",
        messages: messages,
        temperature: temperature || 0.7,
        stream: true
      })
    });

    return new Response(openrouterResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive"
      }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
