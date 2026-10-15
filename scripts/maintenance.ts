import type { Dirent } from 'node:fs';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { beginMaintenance, endMaintenance, maintenance, maintenanceStatus, operation, privateRead, privateRoot } from '../lib/maintenance';
import { applyLimits, closeLimits, previewLimits, reconcileLimits } from '../lib/limiter-cleanup';
import { signExitPlan, signExitProgress, type ExitPlan, type ExitProgress } from '../lib/account-exit';
import { logFailure } from '../lib/logging';
import { exitRequestState } from '../lib/exit-request';

async function main() {
  const [action = 'status', confirmation] = process.argv.slice(2);
  if (action.startsWith('limits-')) {
    const args = process.argv.slice(3);
    if (action === 'limits-preview' && args.length === 0) { console.log(JSON.stringify(await operation(previewLimits))); return; }
    if (action === 'limits-reconcile' && args.length === 1) { console.log(JSON.stringify(await reconcileLimits(args[0]))); return; }
    const applying = action === 'limits-apply' && args.length === 6 && args[1] === '--apply' && args[2] === '--confirm' && args[4] === '--holds-reviewed' && args[5] === '--external-writers-inactive';
    const closing = action === 'limits-close' && args.length === 4 && args[1] === '--confirm' && args[3] === '--holds-reviewed';
    if (!applying && !closing) throw new Error('Preview first; exact target, digest and explicit confirmations required');
    const state = await maintenanceStatus();
    if (!state.closing || state.dirty) throw new Error('Held drained maintenance and reconciled writes required');
    const output = applying
      ? await maintenance(state.closing.epoch, () => applyLimits(args[0], args[3], { apply: true, holdsReviewed: true, externalWritersInactive: true }))
      : await maintenance(state.closing.epoch, () => closeLimits(args[0], args[2], true));
    console.log(JSON.stringify(output));
    if ('complete' in output && !output.complete) process.exitCode = 1;
    return;
  }
  if (action === 'status') { console.log(JSON.stringify(await maintenanceStatus())); return; }
  if (action === 'begin') { console.log(JSON.stringify({ epoch: await beginMaintenance(), drained: true })); return; }
  const state = await maintenanceStatus();
  if (!state.closing) throw new Error('Maintenance is not closed');
  if (action === 'drain') { await maintenance(state.closing.epoch, async () => {}); console.log('Drained; maintenance remains closed.'); return; }
  if (action !== 'end' || confirmation !== state.closing.epoch) throw new Error('Explicit maintenance epoch confirmation required');
  await maintenance(confirmation, async () => {
    const directory = path.join(await privateRoot(), 'exits');
    let cases: Dirent[];
    try { cases = await readdir(directory, { withFileTypes: true }); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; cases = []; }
    for (const entry of cases.filter(entry => entry.isDirectory())) {
      const stored = await privateRead<{ plan: ExitPlan; signature: string }>(path.join(directory, entry.name, 'plan.json'));
      if (!stored || stored.plan.epoch !== confirmation) continue;
      if (stored.signature !== signExitPlan(stored.plan)) throw new Error('Plan review required');
      const request = await exitRequestState(entry.name);
      if (request.status === 'pending' || request.status === 'cancelled') continue;
      const saved = await privateRead<{ progress: ExitProgress; signature: string }>(path.join(directory, entry.name, 'progress.json'));
      if (!saved || saved.progress.stage !== 'complete' || saved.signature !== signExitProgress(stored.plan, saved.progress)) throw new Error('Exit remains incomplete; keep maintenance closed');
    }
    await endMaintenance(confirmation);
  });
  console.log('Maintenance ended.');
}
main().catch(error => { logFailure('operator', error); process.exitCode = 1; });
