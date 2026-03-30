import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service — Aureus Lottery",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950  to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <Link href="/" className="text-[#C9A84C] hover:text-[#e8c97a] text-sm mb-6 inline-block">
          ← Back to home
        </Link>

        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-[#C9A84C] mb-10">Last updated: February 2026</p>

        <div className="space-y-8 text-[#F5F0E8] leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Acceptance of terms</h2>
            <p>By using Aureus Lottery, you agree to these terms of service. If you do not agree to these terms, you must not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. Eligibility</h2>
            <p>To use Aureus, you must:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#F5F0E8]/80">
              <li>Be of legal age to participate in gambling in your country (generally 18 years old)</li>
              <li>Ensure that participation in online lotteries is legal in your jurisdiction</li>
              <li>Not reside in an area where this type of service is explicitly prohibited</li>
            </ul>
            <p className="mt-3 font-medium text-yellow-400">It is your responsibility to verify the legality of the service in your country before participating.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Service description</h2>
            <p>Aureus is a decentralized lottery operating on the Base blockchain:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1 text-[#F5F0E8]/80">
              <li>Ticket price: 1 USDC</li>
              <li>Main draw at 9PM UTC: 1 winner receives 85% of the jackpot</li>
              <li>Bonus draw at 9:30PM UTC: 25 winners share 5% of the jackpot</li>
              <li>10% of each ticket goes to the project treasury</li>
              <li>The result is determined by Chainlink VRF (verifiable randomness)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Financial risks</h2>
            <div className="bg-red-900/20 border border-red-700/50 rounded-xl p-4">
              <p className="font-bold text-red-400 mb-2">Important warning</p>
              <p>Participation in Aureus involves a risk of total loss of the funds committed. Never play more than you can afford to lose. Aureus is not an investment. Gambling can be addictive — if you think you have a problem, contact a support organization.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Smart Contracts and blockchain</h2>
            <p>Blockchain transactions are irreversible. Once a ticket is purchased, no refund is possible. Smart contracts operate autonomously — Aureus has no ability to intervene in draws or modify results.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. User account</h2>
            <p>You are responsible for the security of your account. Never share your password or private key. Aureus will never ask for your private key or recovery seed phrase.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Limitation of liability</h2>
            <p>Aureus is provided "as is". We do not guarantee the absence of service interruptions. We are not responsible for losses related to smart contract bugs, cryptocurrency price fluctuations, or users&apos; gambling decisions.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Changes to terms</h2>
            <p>Aureus reserves the right to modify these terms. Significant changes will be communicated via the site. Continued use of the service after modification constitutes acceptance of the new terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contact</h2>
            <p>For any questions: <a href="mailto:support@aureuslottery.app" className="text-yellow-400 hover:underline">support@aureuslottery.app</a></p>
          </section>
        </div>
      </div>
    </div>
  );
}
