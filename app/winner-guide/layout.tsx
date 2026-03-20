import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Winner Guide — Aureus',
  description: 'Congratulations! Here is how to receive your Aureus lottery winnings.',
};

export default function WinnerGuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
