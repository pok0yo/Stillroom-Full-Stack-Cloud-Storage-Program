import Link from 'next/link';
import { publishedNotices } from '../../lib/terms';
import OperatorContact from '../operator-contact';
export default function TermsPage() {
  const notice = publishedNotices();
  return <main id="main" className="setup"><h1>Beta terms</h1>{notice ? <><p>Effective {notice.effectiveDate}</p><p className="terms-version">Version {notice.version}</p><div className="notice-text">{notice.terms}</div></> : <p>Beta terms have not been published. No terms agreement is currently requested.</p>}<Link href="/">Back to Stillroom</Link><OperatorContact /></main>;
}
