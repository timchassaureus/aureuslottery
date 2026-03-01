import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ — Aureus Lottery',
  description: 'All answers to your questions about Aureus: USDC, security, draws, winnings and more.',
};

const faqs = [
  {
    category: 'General',
    items: [
      {
        q: "What is Aureus?",
        a: "Aureus is a 100% decentralized daily lottery on the Base blockchain. Each ticket costs 1 USDC. A draw takes place every day at 9PM UTC. The winner receives 85% of the jackpot, 25 other winners share 5%, and 10% goes to the project treasury.",
      },
      {
        q: "Is it legal?",
        a: "Aureus operates via public smart contracts on the blockchain. Rules vary by country — please check that participation in online lotteries is allowed in your jurisdiction before playing. You must be of legal age in your country.",
      },
      {
        q: "Who runs Aureus?",
        a: "Aureus is managed by autonomous smart contracts on the Base blockchain. No one can modify the results of draws — everything is publicly verifiable on BaseScan.",
      },
    ],
  },
  {
    category: 'USDC & Payments',
    items: [
      {
        q: "What is USDC?",
        a: "USDC is a stablecoin issued by Circle (a regulated US company). 1 USDC = 1 US dollar, always. It is the most stable crypto — you know exactly how much you spend and how much you win.",
      },
      {
        q: "How do I buy USDC?",
        a: "You can buy USDC directly on Aureus via MoonPay or Ramp (bank card). You can also buy it on Coinbase, Binance, or any exchange and then send it to Base.",
      },
      {
        q: "What fees are there?",
        a: "1 ticket = 1 USDC, no hidden fees. Transactions on Base cost approximately $0.001 in gas. If you buy via MoonPay/Ramp, they charge ~1-3% commission.",
      },
    ],
  },
  {
    category: 'Draws & Winnings',
    items: [
      {
        q: "When do draws take place?",
        a: "Every day at 9:00PM UTC (main draw) and 9:30PM UTC (bonus draw). The main draw selects 1 grand winner, the bonus draw selects 25 winners.",
      },
      {
        q: "How is the winner selected?",
        a: "The winner is selected via Chainlink VRF (Verifiable Random Function) — a cryptographically secure random number generator that is publicly verifiable on the blockchain. No one can manipulate the result.",
      },
      {
        q: "How do I receive my winnings?",
        a: "Winnings are automatically sent to your wallet address as soon as the draw is finalized. No action required on your part.",
      },
      {
        q: "What is my chance of winning?",
        a: "Your chances depend on the total number of tickets sold. With 1 ticket out of 1000 sold, you have a 0.1% chance of winning the main jackpot. The more tickets you buy, the better your chances — and you get discounts starting from 5 tickets.",
      },
    ],
  },
  {
    category: 'Security',
    items: [
      {
        q: "Are my funds safe?",
        a: "Funds are managed by audited smart contracts, with no possibility of arbitrary withdrawal. The distribution (85% jackpot, 5% bonus, 10% treasury) is hardcoded in the contract and cannot be changed.",
      },
      {
        q: "Can Aureus disappear with my money?",
        a: "No. The smart contract is autonomous on the blockchain — no one can modify its behavior or access player funds. Contract addresses are public and verifiable on BaseScan.",
      },
      {
        q: "Is my Aureus account secure?",
        a: "Your password is encrypted (bcrypt) server-side. Your custodial wallet private key is never transmitted to your browser.",
      },
    ],
  },
  {
    category: 'Account & Wallet',
    items: [
      {
        q: "Do I need a crypto wallet to play?",
        a: "No. You create an account with your email and a password — Aureus creates a custodial wallet for you. You pay by card or Apple Pay / Google Pay via Coinbase.",
      },
      {
        q: "I forgot my password, what should I do?",
        a: "Contact us at support@aureuslottery.app with your email address. We will send you a reset link.",
      },
      {
        q: "Can I use Aureus on mobile?",
        a: "Yes! Aureus is optimized for mobile. You can even install it as an app from your browser (PWA): on iOS, tap Share → Add to Home Screen. On Android, tap the menu → Install app.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Link href="/" className="text-purple-400 hover:text-purple-300 text-sm mb-4 inline-block">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-purple-200">Everything you need to know about Aureus Lottery</p>
        </div>

        <div className="space-y-10">
          {faqs.map((section) => (
            <div key={section.category}>
              <h2 className="text-xl font-bold text-yellow-400 mb-4 border-b border-purple-800/50 pb-2">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <details
                    key={item.q}
                    className="group bg-purple-900/20 border border-purple-700/30 rounded-xl overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-purple-800/20 transition-colors list-none">
                      <span className="font-medium pr-4">{item.q}</span>
                      <ChevronDown className="w-5 h-5 text-purple-400 shrink-0 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="px-4 pb-4 text-purple-200 leading-relaxed">
                      {item.a}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 p-6 bg-purple-900/20 border border-purple-700/30 rounded-xl text-center">
          <p className="text-purple-200 mb-3">Didn&apos;t find your answer?</p>
          <a
            href="mailto:support@aureuslottery.app"
            className="inline-block px-6 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-xl transition-all"
          >
            Contact support
          </a>
        </div>
      </div>
    </div>
  );
}
