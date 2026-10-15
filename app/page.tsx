import OperatorContact from './operator-contact';
import { redirect } from 'next/navigation';
import { configured, session } from '../lib/appwrite';
import { Problem } from '../lib/domain';
import { enroll } from '../lib/membership';
import SignOut from './sign-out';
import Workspace from './workspace';
import TermsAgreement from './terms-agreement';
import { needsAgreement, publishedNotices } from '../lib/terms';
export default async function Page() {
  if (!configured()) return <main id="main" className="setup"><span className="wordmark">stillroom<span>.</span></span><p className="eyebrow">A LITTLE SPACE, JUST FOR YOU</p><h1>Good things<br />need a place.</h1><p>Your private file library is ready to connect.</p><section className="notice"><h2>Connect Appwrite to get started</h2><p>Follow <code>docs/SETUP.md</code>, create the approved Appwrite resources, and add the server settings to <code>.env.local</code>.</p><p>No files or accounts are simulated on this screen.</p></section><a className="button" href="/login">Go to sign in</a></main>;
  let auth;
  try { auth = await session(false); } catch (error) { if (error instanceof Problem && error.status === 401) redirect('/login'); return <main id="main" className="setup"><h1>Access unavailable</h1><p>Sign in again or contact the operator.</p><SignOut /><OperatorContact /></main>; }
  if (!auth.user.emailVerification) redirect('/verify');
  try { await enroll(auth.user); } catch (error) { const busy = error instanceof Problem && error.status === 503; return <main id="main" className="setup"><h1>{busy ? 'Access temporarily unavailable' : 'Invitation required'}</h1><p>{busy ? 'Stillroom is busy or undergoing maintenance. Try again later.' : 'An active invitation for your verified email is required. Contact the operator if you need access.'}</p><SignOut /><OperatorContact /></main>; }
  let agreement: string | null | undefined;
  try { if (await needsAgreement(auth.user.$id)) agreement = publishedNotices()!.version; }
  catch { agreement = null; }
  if (agreement !== undefined) return <TermsAgreement version={agreement} />;
  return <Workspace user={{ id: auth.user.$id, name: auth.user.name, email: auth.user.email }} />;
}
