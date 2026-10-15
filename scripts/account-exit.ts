import { maintenance, maintenanceStatus, operation, privateRead, privateSave } from '../lib/maintenance';
import { caseStatus, cleanupEligibility, closeCase, migrateCase, migrationPreview, recordCaseNote, repairCasePointer, requireRecordedHolds } from '../lib/exit-case';
import { readReceipt, cleanupPolicy, exitDirectory, exitRequestState } from '../lib/exit-request';
import { mkdir, readFile, writeFile, rename, open, unlink, realpath } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { applyExit, exitDigest, previewExit, signExitPlan, signExitProgress, type ExitPlan, type ExitProgress, type ExitRequest } from '../lib/account-exit';
import { identifier } from '../lib/domain';
import { logFailure } from '../lib/logging';

async function main() {
  const [action, caseId, ...flags] = process.argv.slice(2);
  if (!action) {
    console.log('Account exit is preview-first. Use preview CASE_ID with a server-issued receipt. No provider calls made.'); return;
  }
  if (action.startsWith('case-')) {
    identifier(caseId);
    const directory = await exitDirectory(caseId);
    execFileSync('git', ['check-ignore', '--quiet', path.join(directory, 'case.json')], { stdio: 'ignore' });
    if (execFileSync('git', ['ls-files', '--', path.relative(process.cwd(), directory)], { encoding: 'utf8' }).trim()) throw new Error('Private records must not be tracked');
    const work = async () => {
      if (action === 'case-eligibility-cleanup') {
        if (flags[0] !== '--target' || !flags[1] || (flags.length !== 2 &&
            (flags.length !== 6 || flags[2] !== '--apply' || flags[3] !== '--confirm' || flags[5] !== '--holds-reviewed'))) throw new Error('Explicit eligibility target and reviewed cleanup confirmation required');
        const report = await cleanupEligibility(caseId, flags[1], flags.length === 6 ? { digest: flags[4], holdsReviewed: true } : undefined);
        console.log(JSON.stringify(report)); return;
      }
      if (action === 'case-migrate') {
        if (flags.length !== 3 || flags[0] !== '--confirm' || flags[2] !== '--history-complete') throw new Error('Reviewed complete history and digest required');
        await migrateCase(caseId, flags[1], true);
      } else {
        if (flags.length) throw new Error('Invalid case flags');
        if (action === 'case-status') {
          const status = await caseStatus(caseId);
          await privateSave(path.join(directory, 'case-report.json'), status);
          console.log(JSON.stringify({ status: status.record.status, execution: status.executionStage, overdue: status.overdue, overdueHoldReviews: status.overdueHoldReviews })); return;
        } else if (action === 'case-preview-migration') {
          const preview = await migrationPreview(caseId);
          await privateSave(path.join(directory, 'case-migration-preview.json'), preview);
          console.log(JSON.stringify({ mode: 'PRIVATE_MIGRATION_PREVIEW', receipts: preview.record.receiptIds.length, reviewDigest: preview.digest, qualification: preview.qualification })); return;
        } else if (action === 'case-repair-pointer') await repairCasePointer(caseId);
        else {
          const input = await privateRead<Record<string, unknown>>(path.join(directory, 'case-input.json'));
          if (!input) throw new Error('Private operator input required');
          if (action === 'case-note') await recordCaseNote(caseId, input);
          else if (action === 'case-close' && Object.keys(input).every(key => key === 'operator')) await closeCase(caseId, input.operator);
          else throw new Error('Invalid case action');
        }
      }
      console.log('Private case record updated. No deletion or retained-record cleanup performed.');
    };
    const closing = (await maintenanceStatus()).closing;
    return closing ? maintenance(closing.epoch, work) : operation(work);
  }
  if (!['preview', 'apply', 'release-holds', 'cleanup-preview'].includes(action)) throw new Error('Invalid action');
  identifier(caseId);
  if (action === 'cleanup-preview') { console.log(JSON.stringify(cleanupPolicy)); return; }
  const receipt = await readReceipt(caseId);
  const closing = (await maintenanceStatus()).closing;
  if (!closing) throw new Error('Maintenance must be closed and drained');
  return maintenance(closing.epoch, async () => {
  const root = await realpath(process.cwd());
  const directory = await exitDirectory(caseId);
  await mkdir(directory, { recursive: true });
  if (await realpath(directory) !== directory) throw new Error('Private directory must not redirect');
  const planPath = path.join(directory, 'plan.json');
  execFileSync('git', ['check-ignore', '--quiet', planPath], { stdio: 'ignore' });
  if (execFileSync('git', ['ls-files', '--', path.relative(root, directory)], { encoding: 'utf8' }).trim()) throw new Error('Private records must not be tracked');
  const lockPath = path.join(path.dirname(directory), 'operator.lock'); const lock = await open(lockPath, 'wx', 0o600);
  const save = async (name: string, value: unknown) => {
    const destination = path.join(directory, name);
    const temp = `${destination}.tmp`;
    await writeFile(temp, JSON.stringify(value, null, 2), { mode: 0o600 }); await rename(temp, destination);
  };
  try {
    if (action === 'preview') {
      if (flags.length && (flags.length !== 2 || flags[0] !== '--replace')) throw new Error('Invalid preview flags');
      if (flags.length && (await exitRequestState(caseId)).status !== 'pending') throw new Error('Only an unclaimed preview can be replaced');
      const holds = JSON.parse(await readFile(path.join(directory, 'holds.json'), 'utf8'));
      const request: ExitRequest = { requestId: caseId, heldFileIds: holds.heldFileIds, accountHold: holds.accountHold };
      const plan = await previewExit(request);
      if (flags.length) {
        const previous = JSON.parse(await readFile(planPath, 'utf8'));
        if (previous.signature !== signExitPlan(previous.plan) || flags[1] !== exitDigest(previous.plan)) throw new Error('Previous preview confirmation required');
        await rename(planPath, path.join(directory, `preview-${flags[1]}.json`));
      }
      // Replacement preserves the old preview; claimed cases and journals cannot be replaced.
      await writeFile(planPath, JSON.stringify({ plan, signature: signExitPlan(plan) }, null, 2), { flag: 'wx', mode: 0o600 });
      console.log(JSON.stringify({ mode: 'PREVIEW', reviewDigest: exitDigest(plan), ownedFiles: plan.owned.length, incomingShares: plan.shares.length, invitations: plan.invitations.length, sessions: plan.sessionIds.length, hasTotals: plan.totals !== null, heldFiles: plan.heldFileIds.length, accountHold: plan.accountHold, privatePlan: '.private/exits/CASE_ID/plan.json' }));
      return;
    }
    const { plan, signature }: { plan: ExitPlan; signature: string } = JSON.parse(await readFile(planPath, 'utf8'));
    if (signature !== signExitPlan(plan) || plan.requestId !== caseId || plan.target !== receipt.accountId || plan.epoch !== closing.epoch) throw new Error('Plan changed');
    const journalPath = path.join(directory, 'progress.json');
    let progress: ExitProgress = { stage: 'prepared', completed: [] };
    try {
      const saved = JSON.parse(await readFile(journalPath, 'utf8'));
      if (saved.signature !== signExitProgress(plan, saved.progress)) throw new Error('Journal changed');
      progress = saved.progress;
    }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    if (!['prepared', 'restricting', 'removing', 'complete'].includes(progress.stage) || !Array.isArray(progress.completed) || progress.completed.some(value => typeof value !== 'string')) throw new Error('Invalid journal');
    if (action === 'release-holds') {
      if (flags.length || progress.stage !== 'removing') throw new Error('Hold review requires interrupted removal');
      const holds = JSON.parse(await readFile(path.join(directory, 'holds.json'), 'utf8'));
      const request: ExitRequest = { requestId: caseId, heldFileIds: holds.heldFileIds, accountHold: holds.accountHold };
      if (receipt.accountId !== plan.target || request.requestId !== plan.requestId || typeof request.accountHold !== 'boolean' || !Array.isArray(request.heldFileIds) || request.heldFileIds.some(id => !plan.heldFileIds.includes(id)) || (!plan.accountHold && request.accountHold)) throw new Error('Only reviewed hold releases allowed');
      const revised = { ...plan, heldFileIds: [...new Set(request.heldFileIds)].sort(), accountHold: request.accountHold };
      await requireRecordedHolds(caseId, revised);
      await save('plan.json', { plan: revised, signature: signExitPlan(revised) });
      console.log(JSON.stringify({ mode: 'REVIEW_ONLY', reviewDigest: exitDigest(revised), heldFiles: revised.heldFileIds.length, accountHold: revised.accountHold })); return;
    }
    if (flags.length !== 4 || flags[0] !== '--confirm' || flags[2] !== '--target' || flags[3] !== plan.target) throw new Error('Explicit digest and stable target confirmation required');
    await requireRecordedHolds(caseId, plan);
    const report = await applyExit(plan, signature, flags[1], progress, value => save('progress.json', { progress: value, signature: signExitProgress(plan, value) }));
    console.log(JSON.stringify(report)); if (!report.complete) process.exitCode = 1;
  } finally { await lock.close(); await unlink(lockPath); }
  });
}
main().catch(error => { logFailure('operator', error); process.exitCode = 1; });
