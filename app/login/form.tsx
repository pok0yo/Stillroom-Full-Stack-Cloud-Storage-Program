'use client';
import { useState } from 'react';
import { api } from '../ui';
export default function AuthForm({ configured }: { configured: boolean }) {
  const [signup, setSignup] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return <div className="auth-form"><p className="eyebrow">MAKE YOURSELF AT HOME</p><h2>{signup ? 'Create your space' : 'Welcome back'}</h2><p>{signup ? 'Use the email address invited by the Stillroom operator.' : 'Sign in to pick up where you left off.'}</p>{!configured && <p className="notice">Appwrite setup is required before you can sign in. See <code>docs/SETUP.md</code>.</p>}<form onSubmit={async event => {
    event.preventDefault(); setBusy(true); setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try { await api(`/api/auth/${signup ? 'signup' : 'signin'}`, 'POST', data); window.location.assign('/'); }
    catch (error) { setError((error as Error).message); setBusy(false); }
  }}>{signup && <label>Your name<input name="name" required maxLength={80} autoComplete="name" /></label>}<label>Email address<input name="email" type="email" required maxLength={254} autoComplete="email" /></label><label>Password<input name="password" type="password" required minLength={8} maxLength={256} autoComplete={signup ? 'new-password' : 'current-password'} /></label><p role="alert">{error}</p><button disabled={busy || !configured} className="primary">{busy ? 'Please wait…' : signup ? 'Create account' : 'Sign in'}</button></form><button className="text-button" onClick={() => { setSignup(!signup); setError(''); }}>{signup ? 'Already have an account? Sign in' : 'New here? Create an account'}</button></div>;
}
