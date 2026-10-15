'use client';
import { useRef, useState } from 'react';
import { api } from './ui';
import ExitRequest from './exit-request';
import SignOut from './sign-out';
import OperatorContact from './operator-contact';

export default function TermsAgreement({ version }: { version: string | null }) {
  const [agreed, setAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const errorRef = useRef<HTMLParagraphElement>(null);
  return <main id="main" className="setup terms-agreement"><span className="wordmark">stillroom.</span>
    <h1>{version ? 'Review the beta terms' : 'Agreement temporarily unavailable'}</h1>
    <p>Your account-exit request and sign-out remain available. Agreement is separate from your age/residence attestation and from the privacy notice.</p>
    <p><a href="/terms">Read beta terms</a> · <a href="/privacy">Read privacy notice</a></p>
    {version && <form onSubmit={async event => {
      event.preventDefault(); if (!agreed || busy) return;
      setBusy(true); setError('');
      try { await api('/api/terms/accept', 'POST', { agree: true, version }); window.location.assign('/'); }
      catch (failure) { setError((failure as Error).message); setAgreed(false); setBusy(false); requestAnimationFrame(() => errorRef.current?.focus()); }
    }}>
      <label className="terms-checkbox"><input type="checkbox" checked={agreed} disabled={busy} onChange={event => setAgreed(event.target.checked)} /> <span>I agree to the Stillroom beta terms, version <span className="terms-version">{version}</span>.</span></label>
      <button className="primary" disabled={!agreed || busy}>{busy ? 'Recording agreement…' : 'Agree and continue'}</button>
      <p ref={errorRef} tabIndex={-1} role="alert">{error}</p>
    </form>}
    <ExitRequest /><SignOut /><OperatorContact />
  </main>;
}
