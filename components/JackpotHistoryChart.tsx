'use client';

import { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface DrawPoint {
  date: string;
  jackpot: number;
  winner: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 border border-[#C9A84C]/40 rounded-xl p-3 shadow-xl">
        <p className="text-[#e8c97a] text-xs mb-1">{label}</p>
        <p className="text-yellow-400 font-bold">${payload[0].value.toLocaleString('en-US')} jackpot</p>
        {payload[0].payload.winner && (
          <p className="text-green-400 text-xs mt-1">
            Winner: {payload[0].payload.winner}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function JackpotHistoryChart() {
  const [data, setData] = useState<DrawPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxJackpot, setMaxJackpot] = useState(0);
  const [totalPaidOut, setTotalPaidOut] = useState(0);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const supabase = createClient();
        const { data: winners } = await supabase
          .from('winners')
          .select('wallet_address, amount_usd, draw_date, draw_type')
          .eq('draw_type', 'main')
          .order('draw_date', { ascending: true })
          .limit(30);

        if (winners && winners.length >= 3) {
          const points: DrawPoint[] = winners.map((w) => ({
            date: new Date(w.draw_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            jackpot: Number(w.amount_usd),
            winner: w.wallet_address
              ? `${w.wallet_address.slice(0, 6)}...${w.wallet_address.slice(-4)}`
              : '',
          }));
          setData(points);
          setMaxJackpot(Math.max(...points.map(p => p.jackpot)));
          setTotalPaidOut(points.reduce((acc, p) => acc + p.jackpot, 0));
        }
        // Fewer than 3 draws: leave data empty → component returns null
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading || data.length < 3) return null;

  return (
    <div className="bg-[#0A0A0F]/60 border border-[#C9A84C]/20 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold">Jackpot History</h3>
          <span className="text-xs text-[#C9A84C]/70">last 30 draws</span>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-[#C9A84C]/70">Record</p>
            <p className="text-yellow-400 font-bold">${maxJackpot.toLocaleString('en-US')}</p>
          </div>
          <div>
            <p className="text-xs text-[#C9A84C]/70">Total paid out</p>
            <p className="text-green-400 font-bold">${totalPaidOut.toLocaleString('en-US')}</p>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="jackpotGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#453412" strokeOpacity={0.3} />
          <XAxis
            dataKey="date"
            tick={{ fill: '#C9A84C', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#C9A84C', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v}`}
            width={45}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="jackpot"
            stroke="#eab308"
            strokeWidth={2}
            fill="url(#jackpotGradient)"
            dot={{ fill: '#eab308', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#fbbf24' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
