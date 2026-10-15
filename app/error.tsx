'use client';
export default function ErrorPage({ reset }: { reset: () => void }) { return <main id="main" className="setup"><h1>Something needs a moment.</h1><p>Stillroom could not load this page. Your files have not been changed by this page error.</p><button onClick={reset}>Try again</button><a href="/login">Sign in</a></main>; }
