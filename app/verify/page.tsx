import OperatorContact from '../operator-contact';
import Link from 'next/link';
import Verification from './verification';
export default function Verify() { return <main id="main" className="setup"><Link href="/" className="wordmark">stillroom<span>.</span></Link><h1>One last step.</h1><p>Verify your email to keep your space yours.</p><Verification /><OperatorContact /></main>; }

