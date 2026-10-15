import { after } from 'node:test';
import { randomUUID } from 'node:crypto';
import { rm } from 'node:fs/promises';
import path from 'node:path';
export const testRoot = path.resolve('.private', `local-test-${process.pid}-${randomUUID()}`);
process.env.STILLROOM_PRIVATE_ROOT = testRoot;
process.env.STILLROOM_COORDINATION_MODE = 'single-host';
after(async () => { await rm(testRoot, { recursive: true, force: true }); });
