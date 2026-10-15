import { createRoot } from 'react-dom/client';
import Workspace from '../../app/workspace';
createRoot(document.getElementById('root')!).render(<Workspace user={{ id: 'alice', name: 'Alex Morgan', email: 'alex@example.test' }} />);
