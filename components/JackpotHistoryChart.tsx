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
      <div className="bg-slate-900 border border-purple-500/50 rounded-xl p-3 shadow-xl">
        <p className="text-purple-300 text-xs mb-1">{label}</p>
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

        if (winners && winners.length > 0) {
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
        } else {
          // Demo data if no draws yet
          const demoData: DrawPoint[] = Array.from({ length: 14 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (13 - i));
            return {
              date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              jackpot: Math.floor(50 + Math.random() * 200),
              winner: '',
            };
          });
          setData(demoData);
          setMaxJackpot(Math.max(...demoData.map(p => p.jackpot)));
          setTotalPaidOut(demoData.reduce((acc, p) => acc + p.jackpot, 0));
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-6 animate-pulse">
        <div className="h-6 w-48 bg-purple-800/50 rounded mb-4" />
        <div className="h-48 bg-purple-800/30 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-purple-900/20 border border-purple-700/30 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-yellow-400" />
          <h3 className="text-lg font-bold">Jackpot History</h3>
          <span className="text-xs text-purple-400">last 30 draws</span>
        </div>
        <div className="flex gap-4 text-right">
          <div>
            <p className="text-xs text-purple-400">Record</p>
            <p className="text-yellow-400 font-bold">${maxJackpot.toLocaleString('en-US')}</p>
          </div>
          <div>
            <p className="text-xs text-purple-400">Total paid out</p>
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
            tick={{ fill: '#a78bfa', fontSize: 10 }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fill: '#a78bfa', fontSize: 10 }}
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
