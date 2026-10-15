import { Client } from 'node-appwrite';

// Child operator tests must never reach a provider, even with synthetic credentials.
Client.prototype.call = async () => {
  process.stderr.write('UNEXPECTED_PROVIDER_CALL\n');
  throw new Error('Synthetic provider boundary reached');
};
globalThis.fetch = async () => {
  process.stderr.write('UNEXPECTED_NETWORK_CALL\n');
  throw new Error('Synthetic network boundary reached');
};
