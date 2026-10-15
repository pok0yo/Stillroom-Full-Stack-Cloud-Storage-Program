'use client';
import { useState } from 'react';
import { api, Dialog } from './ui';

export default function ExitRequest() {
  const [open, setOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [receipt, setReceipt] = useState<{ caseId: string; expiresAt: string } | null>(null);
  const [cancelled, setCancelled] = useState(false);
  async function submit(cancel = false) {
    setBusy(true); setError('');
    try {
      if (cancel) { await api('/api/account-exit/request', 'POST', { action: 'cancel', caseId: receipt!.caseId }); setReceipt(null); setCancelled(true); }
      else { setReceipt(await api('/api/account-exit/request', 'POST', { action: 'request', confirm: confirmed })); setCancelled(false); }
    } catch (error) { setError((error as Error).message); }
    finally { setBusy(false); }
  }
  return <section aria-label="Account exit"><button className="text-button" onClick={() => setOpen(true)}>Request account exit</button>{open && <Dialog title="Request account exit" close={() => setOpen(false)}>
    <div className="exit-request"><p>This records your request for manual operator review. It does not delete anything automatically or promise a completion date.</p>
    <p>Exit removes your account and owned uploads, revokes sharing of those uploads, and removes you from other owners’ shares. Their files remain. Previously downloaded copies cannot be recalled.</p>
    <p>Sign out and sign in again first if your password sign-in was more than 10 minutes ago. Keep independent copies of files you need.</p>
    {receipt ? <div role="status"><p>Request recorded. Reference: <strong>{receipt.caseId}</strong></p><p>Initial approval expires {new Date(receipt.expiresAt).toLocaleString()}. Contact <a href="mailto:yla.stillroom@gmail.com">yla.stillroom@gmail.com</a> with this reference. Send no passwords, tokens, or uploads.</p><p>You may cancel before the operator begins. If maintenance has started, contact the operator.</p><button disabled={busy} onClick={() => submit(true)}>{busy ? 'Cancelling…' : 'Cancel exit request'}</button></div> : <form onSubmit={event => { event.preventDefault(); submit(); }}>
      <label><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)} /> I request account exit with the scope described above.</label>
      <button type="submit" disabled={!confirmed || busy}>{busy ? 'Recording request…' : 'Record exit request'}</button>
    </form>}
    {cancelled && <p role="status">The exit request was cancelled.</p>}
    {error && <p role="alert" className="error">{error}</p>}</div>
  </Dialog>}</section>;
}
