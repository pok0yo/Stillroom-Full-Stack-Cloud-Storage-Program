import { createRoot } from 'react-dom/client';
import TermsAgreement from '../../app/terms-agreement';
createRoot(document.getElementById('root')!).render(<TermsAgreement version={location.pathname === '/unavailable' ? null : 'a'.repeat(64)} />);
