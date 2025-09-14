import type { APIRoute } from 'astro';

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({ ok: true, runtime: 'netlify-functions' }),
    { headers: { 'content-type': 'application/json' } }
  );
