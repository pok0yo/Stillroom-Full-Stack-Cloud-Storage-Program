import Link from 'next/link';
import { publishedNotices } from '../../lib/terms';
import OperatorContact from '../operator-contact';
export default function PrivacyPage() {
  const notice = publishedNotices();
  return <main id="main" className="setup"><h1>Privacy notice</h1>{notice ? <><p>Effective {notice.effectiveDate}</p><div className="notice-text">{notice.privacy}</div></> : <p>The privacy notice has not been published. Contact the operator for information about data handling.</p>}<Link href="/">Back to Stillroom</Link><OperatorContact /></main>;
}
