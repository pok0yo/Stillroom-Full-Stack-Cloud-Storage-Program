// Never serialize errors, request URLs, payloads, names, or provider response bodies.
export function logFailure(event: 'request' | 'setup' | 'verification' | 'operator', error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  console.error('Stillroom failure', { event, code: typeof code === 'number' && Number.isInteger(code) && code >= 400 && code <= 599 ? code : 500 });
}
