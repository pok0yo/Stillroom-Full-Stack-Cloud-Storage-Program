import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const dev = process.env.NODE_ENV !== 'production';
  const csp = `default-src 'self'; script-src 'self' 'nonce-${nonce}'${dev ? " 'unsafe-eval'" : ''}; style-src 'self' 'nonce-${nonce}'; img-src 'self' blob:; media-src 'self' blob:; connect-src 'self'${dev ? ' ws: wss:' : ''}; object-src 'none'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'`;
  const headers = new Headers(request.headers);
  headers.set('x-nonce', nonce);
  headers.set('Content-Security-Policy', csp);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('Cache-Control', 'private, no-store');
  if (!dev) response.headers.set('Strict-Transport-Security', 'max-age=31536000');
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
