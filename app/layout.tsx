import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Stillroom — Space for what matters', description: 'Your files, thoughtfully kept. Private cloud storage with deliberate sharing.' };
export const dynamic = 'force-dynamic';
export default function Layout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><a className="skip-link" href="#main">Skip to content</a>{children}</body></html>;
}
