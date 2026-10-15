import OperatorContact from '../operator-contact';
import Link from 'next/link';
import AuthForm from './form';
import { configured } from '../../lib/appwrite';
export default function Login() { return <main id="main" className="auth-layout"><section className="auth-story"><Link href="/" className="wordmark">stillroom<span>.</span></Link><div><p className="eyebrow">YOUR FILES. A LITTLE MORE SETTLED.</p><h1>Room for<br />what matters.</h1><p>A quiet home for your work, your ideas,<br />and everything worth keeping.</p></div><p className="fine">Private by default. Shared on purpose.</p></section><section className="auth-panel"><div className="auth-content"><AuthForm configured={configured()} /><OperatorContact /></div></section></main>; }

