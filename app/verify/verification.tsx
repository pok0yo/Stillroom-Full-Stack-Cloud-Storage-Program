'use client';
import { useState } from 'react';
import { api } from '../ui';
export default function Verification() {
  const [message, setMessage] = useState('If you opened a verification link, confirm below. Otherwise, request an email.');
  const [busy, setBusy] = useState(false);
  async function act(confirm: boolean) {
    setBusy(true);
    try {
      const params = new URLSearchParams(window.location.search);
      if (confirm) {
        await api('/api/auth/verify', 'POST', { userId: params.get('userId'), secret: params.get('secret') });
        window.history.replaceState({}, '', '/verify'); window.location.assign('/');
      } else { await api('/api/auth/send-verification', 'POST', {}); setMessage('Verification email sent. Check your inbox and spam folder.'); }
    } catch (error) { setMessage((error as Error).message); } finally { setBusy(false); }
  }
  return <section><p role="status">{message}</p><div className="actions"><button disabled={busy} onClick={() => act(false)}>Send verification email</button><button className="primary" disabled={busy} onClick={() => act(true)}>Confirm email link</button><a href="/login">Sign in</a><button disabled={busy} onClick={async () => { try { await api('/api/auth/signout', 'POST', {}); window.location.assign('/login'); } catch (e) { setMessage((e as Error).message); } }}>Sign out</button></div></section>;
}
