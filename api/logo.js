export const config = { runtime: 'edge' };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST', 'Access-Control-Allow-Headers': 'Content-Type' },
    });
  }

  const { prompt } = await req.json();

  const fullPrompt = `Professional minimalist logo design, flat vector style, clean solid background, bold typography, simple geometric icon. Brand: ${prompt}. Style: modern, premium, like Apple or Nike branding.`;

  // Together.ai — FLUX.1-schnell-Free is completely free
  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'black-forest-labs/FLUX.1-schnell-Free',
      prompt: fullPrompt,
      width: 1024,
      height: 1024,
      steps: 4,
      n: 1,
      response_format: 'b64_json',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    return new Response(JSON.stringify({ error: data.error?.message || 'Generation failed' }), {
      status: response.status,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  const b64 = data.data?.[0]?.b64_json || '';
  if (!b64) {
    return new Response(JSON.stringify({ error: 'No image generated' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }

  return new Response(JSON.stringify({ b64 }), {
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}
