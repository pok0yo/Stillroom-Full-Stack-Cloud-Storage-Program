'use client';
import { useEffect, useRef } from 'react';
export async function api<T = { ok: boolean }>(url: string, method = 'GET', data?: unknown): Promise<T> {
  const response = await fetch(url, { method, headers: data === undefined ? undefined : { 'Content-Type': 'application/json' }, body: data === undefined ? undefined : JSON.stringify(data), cache: 'no-store' });
  const result = await response.json();
  if (!response.ok) throw Object.assign(new Error(result.error || 'Request failed. Please try again.'), { status: response.status });
  return result;
}
export function Dialog({ title, close, children }: { title: string; close: () => void; children: React.ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { const dialog = ref.current!; const previous = document.activeElement as HTMLElement; dialog.showModal(); return () => { dialog.close(); previous?.focus(); }; }, []);
  return <dialog ref={ref} aria-labelledby="dialog-title" onCancel={close}><div className="dialog-heading"><h2 id="dialog-title">{title}</h2><button aria-label="Close dialog" onClick={close}>Close</button></div>{children}</dialog>;
}
export function Glyph({ kind }: { kind: string }) {
  return <span className={`file-glyph ${kind}`} aria-hidden="true">{kind === 'image' ? 'IMG' : kind === 'audio' ? 'AUD' : kind === 'video' ? 'VID' : 'DOC'}</span>;
}
