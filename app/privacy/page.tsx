import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Aureus Lottery',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-6 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-purple-400 mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-purple-100 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Data collected</h2>
            <p>Aureus only collects data necessary for the operation of the service:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-purple-200">
              <li>Email address (when creating an account)</li>
              <li>Username / display name</li>
              <li>Blockchain wallet address (public by nature)</li>
              <li>On-chain transaction history (public on the blockchain)</li>
            </ul>
            <p className="mt-3">We do not collect: phone number, postal address, banking details (payments go through MoonPay/Ramp).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Use of data</h2>
            <p>Your data is used to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-purple-200">
              <li>Manage your account and access to the service</li>
              <li>Display your ticket and winnings history</li>
              <li>Contact you in case of a win or technical issue</li>
              <li>Prevent fraud and abuse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Storage and security</h2>
            <p>Your data is stored on Supabase servers (hosted on AWS). Passwords are encrypted via bcrypt. Custodial wallet private keys never leave our servers and are never transmitted to your browser.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data sharing</h2>
            <p>We do not sell or rent your data to third parties. Your data may be shared with:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-purple-200">
              <li>Supabase (database)</li>
              <li>Vercel (hosting)</li>
              <li>MoonPay / Ramp (payments — subject to their own policies)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Blockchain and transparency</h2>
            <p>Transactions on the Base blockchain are public and permanent. Your wallet address and ticket purchase history are visible on BaseScan by anyone who knows your address.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your rights</h2>
            <p>You may at any time:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-purple-200">
              <li>Request access to your personal data</li>
              <li>Request deletion of your account</li>
              <li>Correct inaccurate information</li>
            </ul>
            <p className="mt-3">Contact us at: <a href="mailto:support@aureuslottery.app" className="text-yellow-400 hover:underline">support@aureuslottery.app</a></p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Cookies</h2>
            <p>Aureus uses strictly necessary technical cookies for the operation of the service (session, authentication). No advertising or third-party tracking cookies are used.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Contact</h2>
            <p>For any questions regarding this policy: <a href="mailto:support@aureuslottery.app" className="text-yellow-400 hover:underline">support@aureuslottery.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
