'use client';
import { useState } from 'react';
import { api } from './ui';
export default function SignOut() {
  const [message, setMessage] = useState('');
  return <><button onClick={async () => { try { await api('/api/auth/signout', 'POST', {}); window.location.assign('/login'); } catch { setMessage('Sign-out could not be confirmed. Try again.'); } }}>Sign out</button><p role="status">{message}</p></>;
}
