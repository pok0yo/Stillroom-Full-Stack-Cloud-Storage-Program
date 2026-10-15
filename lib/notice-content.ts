import 'server-only';

export type PublishedNotices = { effectiveDate: string; terms: string; privacy: string };
// Activation requires separately approved publication, provider checks and a drained deployment.
// No environment switch can publish the unfinished candidates.
export const noticePublication: { current: PublishedNotices | null } = { current: null };
