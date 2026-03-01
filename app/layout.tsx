import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ToastProvider from "@/components/ToastProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import ReferralDetect from "@/components/ReferralDetect";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aureus — Daily Crypto Lottery on Base",
  description: "Daily crypto lottery on Base blockchain. Buy tickets for $1 USDC and win jackpots every day at 9PM UTC. Transparent, on-chain, verifiable.",
  keywords: ["crypto lottery", "blockchain lottery", "Base network", "USDC", "jackpot", "web3"],
  manifest: "/manifest.json",
  openGraph: {
    title: "Aureus — Daily Crypto Lottery on Base",
    description: "Buy tickets for $1 USDC. Win big jackpots every day at 9PM UTC. 100% on-chain.",
    type: "website",
    url: "https://aureuslottery.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aureus — Daily Crypto Lottery",
    description: "Win daily jackpots on Base blockchain. $1 USDC per ticket.",
  },
  robots: {
    index: true,
    follow: true,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Aureus",
  },
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
            <ReferralDetect />
            <ToastProvider />
            <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-950 via-slate-950 to-slate-950">
              <main className="flex-1">{children}</main>
              <footer className="border-t border-white/5 bg-black/70 text-[11px] text-slate-300/80 px-4 py-4 text-center leading-snug">
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mb-3 text-purple-400">
                  <a href="/faq" className="hover:text-purple-200 transition-colors">FAQ</a>
                  <a href="/terms" className="hover:text-purple-200 transition-colors">Terms of Service</a>
                  <a href="/privacy" className="hover:text-purple-200 transition-colors">Privacy</a>
                  <a href="/winner-guide" className="hover:text-purple-200 transition-colors">Winner Guide</a>
                  <a href="mailto:support@aureuslottery.app" className="hover:text-purple-200 transition-colors">Support</a>
                </div>
                <p>
                  Aureus is a decentralized lottery application secured by on-chain smart contracts.
                  Contracts are public and verifiable on BaseScan.
                </p>
                <p className="mt-1">
                  No information on this site constitutes financial, legal or tax advice.
                  Participation in the lottery is risky and you may lose 100% of the funds staked.
                  It is your responsibility to verify that online lotteries are legal in your country
                  and that you are of legal age.
                </p>
                <p className="mt-2 text-purple-500">© 2026 Aureus Lottery · aureuslottery.app</p>
              </footer>
            </div>
          </ErrorBoundary>
      </body>
    </html>
  );
}
