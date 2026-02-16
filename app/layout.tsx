import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aureus | Crypto Lottery",
  description: "Daily crypto lottery on Base. Buy tickets for $1 USDC, win big jackpots every day at 9PM & 9:30PM UTC!",
};

export const viewport = {
  width: 'device-width',
  initialScale: 0.85,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ErrorBoundary>
          <ToastProvider />
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950">
            <main className="flex-1">{children}</main>
            <footer className="border-t border-white/5 bg-black/70 text-[11px] text-slate-300/80 px-4 py-3 text-center leading-snug">
              <p>
                Aureus is a decentralized lottery application secured by on-chain smart contracts.
                Core protocol contracts are designed to be independently audited by professional
                security firms before mainnet launch and remain fully transparent and verifiable
                on the blockchain.
              </p>
              <p className="mt-1">
                Nothing on this website is financial, legal or tax advice. Participating in the
                lottery is high-risk and you can lose 100% of the funds you play with. You are
                solely responsible for checking that online lotteries and crypto-assets are legal
                in your jurisdiction and that you meet the minimum legal age requirements.
              </p>
            </footer>
          </div>
        </ErrorBoundary>
      </body>
    </html>
  );
}
