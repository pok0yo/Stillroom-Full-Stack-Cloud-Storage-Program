import { coordinatedClient, operation } from '../lib/maintenance';
import { logFailure } from '../lib/logging';
import { Client, TablesDB, Storage, Compression } from 'node-appwrite';
import { tables } from './schema';
import { MAX_BYTES } from '../lib/domain';
import { extensions } from '../lib/validation';
async function main() {
  if (!process.argv.includes('--apply')) { console.log(JSON.stringify({ tables, bucket: { maximumFileSize: MAX_BYTES, extensions, permissions: [], fileSecurity: true } }, null, 2)); console.log('Dry run only. Resource creation requires explicit approval, then --apply.'); return; }
  for (const key of ['APPWRITE_ENDPOINT', 'APPWRITE_PROJECT_ID', 'APPWRITE_API_KEY', 'APPWRITE_DATABASE_ID', 'APPWRITE_BUCKET_ID']) if (!process.env[key]) throw new Error(`Missing ${key}`);
  const client = coordinatedClient(new Client().setEndpoint(process.env.APPWRITE_ENDPOINT!).setProject(process.env.APPWRITE_PROJECT_ID!)).setKey(process.env.APPWRITE_API_KEY!);
  const db = new TablesDB(client); const databaseId = process.env.APPWRITE_DATABASE_ID!;
  await db.create({ databaseId, name: 'Stillroom' });
  console.log('Created database.');
  for (const table of tables) {
    await db.createTable({ databaseId, tableId: table.tableId, name: table.tableId, permissions: [], rowSecurity: true, columns: table.columns, indexes: table.indexes });
    console.log(`Created ${table.tableId}. Check column and index availability in the console.`);
  }
  await new Storage(client).createBucket({ bucketId: process.env.APPWRITE_BUCKET_ID!, name: 'Stillroom', permissions: [], fileSecurity: true, maximumFileSize: MAX_BYTES, allowedFileExtensions: extensions, compression: Compression.None, encryption: true, antivirus: true, transformations: false });
  console.log('Created private bucket. Remove setup scopes from the runtime API key before use.');
}
operation(main).catch(error => { logFailure('setup', error); process.exitCode = 1; });
