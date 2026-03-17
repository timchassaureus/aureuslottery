'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

type Phase = 'ignition' | 'chaos' | 'tension' | 'suspense' | 'revelation';

interface Participant {
  address: string;
  ticketCount: number;
  username?: string;
}

interface EpicDrawCeremonyProps {
  participants: Participant[];
  winner: string;
  winnerUsername?: string;
  prize: number;
  totalTickets?: number;
  userAddress?: string;
  userUsername?: string;
  onComplete: () => void;
}

const PHASE_DURATIONS: Record<Phase, number> = {
  ignition: 3200,
  chaos: 7500,
  tension: 6500,
  suspense: 5000,
  revelation: 12000,
};
const PHASE_ORDER: Phase[] = ['ignition', 'chaos', 'tension', 'suspense', 'revelation'];

// Pseudo-style fake names for demo (when not enough real players)
const DEMO_NAMES = [
  'LuckyStrike88', 'GoldRush_Tim', 'DiamondKing', 'NightRider99', 'MoonShot42',
  'SilverFox_Pro', 'JackpotHunter', 'RoyalFlush77', 'ThunderBolt_X', 'CryptoWolf',
  'GoldenEagle', 'StarDust_2024', 'IronFist_Leo', 'WildCard_Boss', 'AceOfSpades',
  'PhoenixRising', 'ShadowKing99', 'BlueDragon_Z', 'FortuneTeller', 'LegendWinner',
  'DarkHorse_Pro', 'TitanSlayer', 'CosmicLuck', 'ElitePlayer1', 'VIPMember_X',
  'UltraWinner', 'BigBang_2024', 'RainMaker_9', 'GoldDigger_V', 'TopGunner77',
  'CrimsonFox', 'SteelNight_R', 'ZenMaster_G', 'NeonLancer', 'FrostGiant_K',
  'VortexKnight', 'IceBreaker99', 'SunStrike_M', 'DeepBlue_Pro', 'LastChance_X',
  'EpicGamer77', 'QuickDraw_J', 'SpeedDemon_T', 'BlazeRunner', 'ChaosMaster',
  'TrueNorth_R', 'WildFire_Pro', 'OmegaForce_Z', 'NightHawk_88', 'AllIn_Player',
  'CashKing_Pro', 'DiamondHands', 'ZeroToHero', 'TopDog_2024', 'LuckyCharm99',
  'DoubleDown_V', 'UltraRich_X', 'GoldenTouch', 'PureGold_88', 'TheChosenOne',
];

function shortAddr(addr: string): string {
  if (!addr || addr.length < 10) return addr || '???';
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function displayName(p: Participant): string {
  return p.username || shortAddr(p.address);
}

function secureRandInt(max: number): number {
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % max;
}

export default function EpicDrawCeremony({
  participants,
  winner,
  winnerUsername,
  prize,
  totalTickets = 0,
  userAddress,
  userUsername,
  onComplete,
}: EpicDrawCeremonyProps) {
  const [phase, setPhase] = useState<Phase>('ignition');
  const [currentName, setCurrentName] = useState('');
  const [nameKey, setNameKey] = useState(0);
  const [displayedPrize, setDisplayedPrize] = useState(0);
  const [finalists, setFinalists] = useState<string[]>(['', '', '']);
  const [activeFinalist, setActiveFinalist] = useState(0);
  const [confetti, setConfetti] = useState<Array<{
    id: number; x: number; color: string; size: number;
    delay: number; duration: number; rot: number; shape: 'rect' | 'circle' | 'star';
  }>>([]);
  const [fireParticles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: 2 + i * 5,
      color: ['#FF4500', '#FF6B00', '#FFB347', '#FFD700', '#FF8C00'][i % 5],
      delay: (i * 0.11) % 1.1,
      dur: 0.85 + (i % 6) * 0.25,
    }))
  );
  const [isShaking, setIsShaking] = useState(false);
  const [isFlashing, setIsFlashing] = useState(false);
  const [heartbeat, setHeartbeat] = useState(false);
  const [showWinnerBadge, setShowWinnerBadge] = useState(false);
  const [userInDraw, setUserInDraw] = useState(false);
  const [progress, setProgress] = useState(0);
  const [chaosGlitch, setChaosGlitch] = useState(false);

  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nameTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const rafIdRef = useRef<number>(0);        // stable ref for prize counter RAF
  const counterDoneRef = useRef(false);      // guard against double-start (React Strict Mode)
  const onCompleteRef = useRef(onComplete);  // stable ref — prevents effect re-run on every parent render
  onCompleteRef.current = onComplete;

  const winnerDisplay = winnerUsername || shortAddr(winner);

  // Weighted name pool by ticket count
  const pool = useMemo(() => {
    let names: string[] = [];

    if (participants.length > 0) {
      for (const p of participants) {
        const n = displayName(p);
        const reps = Math.min(p.ticketCount, 12);
        for (let i = 0; i < reps; i++) names.push(n);
      }
    }

    // Fill with fake names if fewer than 30 entries
    if (names.length < 30) {
      const shuffledDemo = [...DEMO_NAMES].sort(() => (secureRandInt(2) === 0 ? -1 : 1));
      names = [...names, ...shuffledDemo.slice(0, 60 - names.length)];
    }

    // Fisher-Yates shuffle
    for (let i = names.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1);
      [names[i], names[j]] = [names[j], names[i]];
    }
    return names;
  }, [participants]);

  const playerCount = participants.length || DEMO_NAMES.length;
  const totalTix = totalTickets || participants.reduce((s, p) => s + p.ticketCount, 0) || 3291;

  // Check if user is in the draw
  useEffect(() => {
    if (userAddress) {
      const inDraw = participants.some(p => p.address.toLowerCase() === userAddress.toLowerCase());
      setUserInDraw(inDraw);
    }
  }, [userAddress, participants]);

  // Global progress bar
  useEffect(() => {
    const total = Object.values(PHASE_DURATIONS).reduce((a, b) => a + b, 0);
    const id = setInterval(() => {
      setProgress(Math.min(((Date.now() - startTimeRef.current) / total) * 100, 100));
    }, 150);
    return () => clearInterval(id);
  }, []);

  // Phase sequencer
  useEffect(() => {
    let idx = 0;
    const advance = () => {
      idx++;
      if (idx < PHASE_ORDER.length) {
        const next = PHASE_ORDER[idx];
        setPhase(next);
        phaseTimerRef.current = setTimeout(advance, PHASE_DURATIONS[next]);
      }
    };
    phaseTimerRef.current = setTimeout(advance, PHASE_DURATIONS.ignition);
    return () => { if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current); };
  }, []);

  const pushName = useCallback((name: string) => {
    setCurrentName(name);
    setNameKey(k => k + 1);
  }, []);

  // Name cycling per phase
  useEffect(() => {
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);

    if (phase === 'chaos') {
      // Random glitch effect
      const glitchId = setInterval(() => {
        if (secureRandInt(4) === 0) {
          setChaosGlitch(true);
          setTimeout(() => setChaosGlitch(false), 80);
        }
      }, 600);

      const roll = () => {
        pushName(pool[secureRandInt(pool.length)]);
        nameTimerRef.current = setTimeout(roll, 48);
      };
      nameTimerRef.current = setTimeout(roll, 48);
      return () => { clearInterval(glitchId); if (nameTimerRef.current) clearTimeout(nameTimerRef.current); };
    }

    if (phase === 'tension') {
      let delay = 100;
      let hbStarted = false;
      const roll = () => {
        pushName(pool[secureRandInt(pool.length)]);
        delay = Math.min(delay * 1.20, 2600);
        if (delay > 400 && !hbStarted) { hbStarted = true; setHeartbeat(true); }
        nameTimerRef.current = setTimeout(roll, delay);
      };
      nameTimerRef.current = setTimeout(roll, 100);
    }

    return () => { if (nameTimerRef.current) clearTimeout(nameTimerRef.current); };
  }, [phase, pool, pushName]);

  // Phase SUSPENSE — 3 finalists
  useEffect(() => {
    if (phase !== 'suspense') return;
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);

    // Build 3 finalists including the real winner
    const shuffled = [...pool];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = secureRandInt(i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    const pos = secureRandInt(3);
    const others = shuffled.filter(n => n !== winnerDisplay).slice(0, 2);
    const three: string[] = [others[0] || 'LuckyPlayer_1', others[1] || 'GoldChaser_2', winnerDisplay];
    // Place winner at random position
    [three[pos], three[2]] = [three[2], three[pos]];

    setFinalists(three);
    let fi = 0;
    const id = setInterval(() => { fi = (fi + 1) % 3; setActiveFinalist(fi); }, 1500);
    return () => clearInterval(id);
  }, [phase, pool, winnerDisplay]);

  // Phase REVELATION
  useEffect(() => {
    if (phase !== 'revelation') return;
    if (nameTimerRef.current) clearTimeout(nameTimerRef.current);
    setHeartbeat(false);
    setChaosGlitch(false);
    pushName(winnerDisplay);

    // Flash + shake sequence
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 380);
    setTimeout(() => { setIsShaking(true); setTimeout(() => setIsShaking(false), 750); }, 180);

    // Winner badge
    if (userAddress && winner.toLowerCase() === userAddress.toLowerCase()) {
      setTimeout(() => setShowWinnerBadge(true), 700);
    }

    // Varied confetti
    setTimeout(() => {
      setConfetti(Array.from({ length: 100 }, (_, i) => ({
        id: i,
        x: secureRandInt(100),
        color: ['#FFD700', '#FF6B35', '#FF4500', '#FFB347', '#FFFFFF', '#FF69B4', '#00BFFF', '#7FFF00', '#FF1493'][i % 9],
        size: 5 + secureRandInt(9),
        delay: (i % 22) * 0.09,
        duration: 2.4 + (i % 12) * 0.28,
        rot: secureRandInt(720) - 360,
        shape: (['rect', 'circle', 'star'] as const)[i % 3],
      })));
    }, 150);

    // Prize counter — guard against React Strict Mode double-invoke
    if (counterDoneRef.current) return;
    counterDoneRef.current = true;

    const startTime = Date.now();
    const dur = 3200;
    const tick = () => {
      const t = Math.min((Date.now() - startTime) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplayedPrize(Math.floor(eased * prize));
      if (t < 1) {
        rafIdRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayedPrize(prize);
      }
    };
    rafIdRef.current = requestAnimationFrame(tick);

    const completeTimer = setTimeout(() => {
      if (!completedRef.current) { completedRef.current = true; onCompleteRef.current(); }
    }, PHASE_DURATIONS.revelation - 600);

    return () => {
      cancelAnimationFrame(rafIdRef.current);
      clearTimeout(completeTimer);
      counterDoneRef.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, winner, winnerDisplay, prize, userAddress, pushName]);

  const isUserWinner = winner && userAddress && winner.toLowerCase() === userAddress.toLowerCase();
  const myDisplayName = userUsername || (userAddress ? shortAddr(userAddress) : null);

  return (
    <div
      className="fixed inset-0 z-[9999] select-none overflow-hidden"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #1e0a3c 0%, #0d0018 55%, #000000 100%)' }}
    >
      {/* ── CSS animations ── */}
      <style>{`
        @keyframes edc-float-up {
          0%   { transform:translateY(0) rotate(var(--rot,0deg)); opacity:1; }
          80%  { opacity:1; }
          100% { transform:translateY(-115vh) rotate(calc(var(--rot,0deg)*3.5)); opacity:0; }
        }
        @keyframes edc-fire {
          0%   { transform:translateY(0) scaleX(1); opacity:0.9; }
          50%  { transform:translateY(-40px) scaleX(1.3); opacity:1; }
          100% { transform:translateY(-80px) scaleX(0.5); opacity:0; }
        }
        @keyframes edc-slot-in {
          0%   { transform:translateY(32px); opacity:0; filter:blur(8px); }
          100% { transform:translateY(0); opacity:1; filter:blur(0); }
        }
        @keyframes edc-slot-fast {
          0%   { transform:translateY(16px) scaleY(1.1); opacity:0; }
          100% { transform:translateY(0) scaleY(1); opacity:1; }
        }
        @keyframes edc-heartbeat {
          0%,100% { transform:scale(1); }
          14%  { transform:scale(1.1); }
          28%  { transform:scale(1); }
          42%  { transform:scale(1.06); }
          70%  { transform:scale(1); }
        }
        @keyframes edc-shake {
          0%,100% { transform:translate(0,0) rotate(0deg); }
          10% { transform:translate(-10px,-5px) rotate(-0.5deg); }
          20% { transform:translate(10px,5px) rotate(0.5deg); }
          30% { transform:translate(-8px,8px) rotate(-0.3deg); }
          40% { transform:translate(8px,-8px) rotate(0.3deg); }
          50% { transform:translate(-5px,5px); }
          60% { transform:translate(5px,-5px); }
          80% { transform:translate(-2px,2px); }
          90% { transform:translate(2px,-2px); }
        }
        @keyframes edc-crown {
          0%,100% { transform:translateY(0) rotate(-6deg) scale(1); }
          50%     { transform:translateY(-20px) rotate(6deg) scale(1.1); }
        }
        @keyframes edc-prize-pop {
          0%  { transform:scale(0.3); opacity:0; }
          60% { transform:scale(1.2); opacity:1; }
          100%{ transform:scale(1); opacity:1; }
        }
        @keyframes edc-badge-pop {
          0%  { transform:scale(0) rotate(-15deg); opacity:0; }
          60% { transform:scale(1.18) rotate(3deg); opacity:1; }
          100%{ transform:scale(1) rotate(0); opacity:1; }
        }
        @keyframes edc-finalist-glow {
          0%,100% { box-shadow:0 0 0 2px rgba(255,215,0,0); }
          50%     { box-shadow:0 0 28px 6px rgba(255,215,0,0.8), 0 0 60px 10px rgba(255,107,0,0.3); }
        }
        @keyframes edc-glow-box {
          0%,100% { box-shadow:0 0 18px rgba(255,215,0,0.25),0 0 40px rgba(255,107,0,0.1); }
          50%     { box-shadow:0 0 45px rgba(255,215,0,0.85),0 0 90px rgba(255,107,0,0.35); }
        }
        @keyframes edc-scan {
          0%   { transform:translateY(-100%); }
          100% { transform:translateY(100vh); }
        }
        @keyframes edc-star {
          0%,100% { opacity:0.15; transform:scale(1); }
          50%     { opacity:0.9; transform:scale(1.8); }
        }
        @keyframes edc-title-in {
          0%   { letter-spacing:1em; opacity:0; transform:scaleX(1.3); }
          100% { letter-spacing:0.12em; opacity:1; transform:scaleX(1); }
        }
        @keyframes edc-glitch {
          0%,100% { transform:translateX(0) skewX(0); filter:hue-rotate(0deg); }
          20%     { transform:translateX(-4px) skewX(-2deg); filter:hue-rotate(90deg); }
          40%     { transform:translateX(4px) skewX(2deg); filter:hue-rotate(180deg); }
          60%     { transform:translateX(-2px); filter:hue-rotate(270deg); }
          80%     { transform:translateX(2px); }
        }
        @keyframes edc-user-pulse {
          0%,100% { box-shadow:0 0 0 0 rgba(99,102,241,0.7); }
          50%     { box-shadow:0 0 0 8px rgba(99,102,241,0); }
        }
        @keyframes edc-ticket-float {
          0%   { transform:translateY(0) rotate(-3deg); }
          50%  { transform:translateY(-8px) rotate(3deg); }
          100% { transform:translateY(0) rotate(-3deg); }
        }
        .edc-slot-in      { animation:edc-slot-in   0.2s  ease-out  forwards; }
        .edc-slot-fast    { animation:edc-slot-fast  0.07s ease-out  forwards; }
        .edc-heartbeat    { animation:edc-heartbeat  0.85s ease-in-out infinite; }
        .edc-shake        { animation:edc-shake      0.75s ease-in-out; }
        .edc-crown        { animation:edc-crown      2.3s  ease-in-out infinite; }
        .edc-prize-pop    { animation:edc-prize-pop  0.65s cubic-bezier(.175,.885,.32,1.275) forwards; }
        .edc-badge-pop    { animation:edc-badge-pop  0.55s cubic-bezier(.175,.885,.32,1.275) forwards; }
        .edc-finalist-hl  { animation:edc-finalist-glow 1.2s ease-in-out infinite; }
        .edc-glow-box     { animation:edc-glow-box   2.2s  ease-in-out infinite; }
        .edc-title-in     { animation:edc-title-in   1s    cubic-bezier(.25,.46,.45,.94) forwards; }
        .edc-glitch       { animation:edc-glitch     0.12s linear; }
        .edc-user-pulse   { animation:edc-user-pulse 1.5s  ease-in-out infinite; }
        .edc-ticket-float { animation:edc-ticket-float 2s  ease-in-out infinite; }
      `}</style>

      {/* Background stars */}
      {Array.from({ length: 40 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white pointer-events-none"
          style={{
            left: `${(i * 89 + 11) % 100}%`,
            top: `${(i * 67 + 5) % 88}%`,
            width: `${1 + (i % 3)}px`,
            height: `${1 + (i % 3)}px`,
            animation: `edc-star ${1.6 + (i % 9) * 0.35}s ease-in-out ${(i % 12) * 0.18}s infinite`,
          }}
        />
      ))}

      {/* Scanline (chaos phase only) */}
      {phase === 'chaos' && (
        <div
          className="absolute inset-x-0 h-28 pointer-events-none"
          style={{
            background: 'linear-gradient(transparent, rgba(255,215,0,0.05), transparent)',
            animation: 'edc-scan 1.6s linear infinite',
          }}
        />
      )}

      {/* Fire particles */}
      {(phase === 'ignition' || phase === 'chaos' || phase === 'tension') &&
        fireParticles.map(fp => (
          <div
            key={fp.id}
            className="absolute bottom-0 pointer-events-none"
            style={{
              left: `${fp.x}%`,
              width: '9px',
              height: '24px',
              borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
              background: `radial-gradient(ellipse at bottom, ${fp.color}, transparent)`,
              animation: `edc-fire ${fp.dur}s ease-out ${fp.delay}s infinite`,
              opacity: phase === 'chaos' ? 1 : 0.5,
            }}
          />
        ))}

      {/* Golden flash */}
      <div
        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle at 50% 40%, rgba(255,215,0,0.95), rgba(255,80,0,0.6))',
          opacity: isFlashing ? 1 : 0,
          zIndex: 60,
        }}
      />

      {/* Confetti */}
      {confetti.map(c => (
        <div
          key={c.id}
          className="absolute pointer-events-none"
          style={{
            left: `${c.x}%`,
            bottom: '-10px',
            width: c.shape === 'circle' ? `${c.size}px` : `${c.size}px`,
            height: c.shape === 'circle' ? `${c.size}px` : `${c.size * 0.42}px`,
            backgroundColor: c.color,
            borderRadius: c.shape === 'circle' ? '50%' : c.shape === 'star' ? '2px' : '2px',
            '--rot': `${c.rot}deg`,
            animation: `edc-float-up ${c.duration}s ease-out ${c.delay}s both`,
          } as React.CSSProperties}
        />
      ))}

      {/* Shake wrapper */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center gap-5 px-5 ${isShaking ? 'edc-shake' : ''}`}>

        {/* Progress bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-white/10">
          <div
            className="h-full transition-[width] duration-200"
            style={{
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #7c3aed, #f59e0b, #ef4444)',
            }}
          />
        </div>

        {/* "YOUR TICKET IS IN!" badge */}
        {userInDraw && (phase === 'ignition' || phase === 'chaos') && myDisplayName && (
          <div
            className="absolute top-6 left-1/2 -translate-x-1/2 edc-ticket-float"
            style={{ zIndex: 10 }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-400/60 text-indigo-200 text-sm font-bold edc-user-pulse"
              style={{ background: 'rgba(99,102,241,0.2)' }}
            >
              <span>🎫</span>
              <span>{myDisplayName} — YOUR TICKET IS IN!</span>
            </div>
          </div>
        )}

        {/* ══════════ IGNITION ══════════ */}
        {phase === 'ignition' && (
          <div className="flex flex-col items-center gap-6 text-center w-full max-w-md px-2">
            {/* Crown + Title */}
            <div className="flex flex-col items-center gap-3">
              <div className="text-8xl edc-crown" style={{ filter: 'drop-shadow(0 0 28px rgba(255,215,0,0.9))' }}>
                🏆
              </div>
              <div>
                <div
                  className="text-5xl font-black text-yellow-400 edc-title-in tracking-widest"
                  style={{ textShadow: '0 0 50px rgba(255,215,0,0.9), 0 0 100px rgba(255,107,0,0.5)' }}
                >
                  DAILY DRAW
                </div>
                <div className="text-yellow-500/70 text-sm tracking-[0.35em] uppercase mt-2 animate-pulse font-semibold">
                  The moment has come — who wins today?
                </div>
              </div>
            </div>

            {/* Big prize card */}
            <div
              className="w-full rounded-3xl p-5 border-2 border-yellow-400/50 edc-glow-box"
              style={{ background: 'rgba(255,215,0,0.08)' }}
            >
              <div className="text-yellow-400/80 text-xs font-black tracking-[0.5em] uppercase mb-2">Tonight&apos;s Prize Pool</div>
              <div
                className="text-5xl font-black text-white"
                style={{ textShadow: '0 0 40px rgba(255,215,0,0.8)' }}
              >
                ${prize.toLocaleString('en-US')}
              </div>
              <div className="text-yellow-600/60 text-xs mt-2 tracking-wide">Winner takes it all — paid in USDC</div>
            </div>

            {/* Players + Tickets side by side */}
            <div className="grid grid-cols-2 gap-4 w-full">
              <div
                className="rounded-2xl p-5 border border-yellow-500/30 text-center"
                style={{ background: 'rgba(255,215,0,0.05)' }}
              >
                <div className="text-4xl mb-2">👥</div>
                <div className="text-white font-black text-2xl leading-tight">{playerCount.toLocaleString('en-US')}</div>
                <div className="text-yellow-400/80 text-xs font-bold uppercase tracking-wider mt-1">Active Players</div>
                <div className="text-gray-500 text-[10px] mt-1">Competing right now</div>
              </div>
              <div
                className="rounded-2xl p-5 border border-yellow-500/30 text-center"
                style={{ background: 'rgba(255,215,0,0.05)' }}
              >
                <div className="text-4xl mb-2">🎫</div>
                <div className="text-white font-black text-2xl leading-tight">{totalTix.toLocaleString('en-US')}</div>
                <div className="text-yellow-400/80 text-xs font-bold uppercase tracking-wider mt-1">Tickets in Play</div>
                <div className="text-gray-500 text-[10px] mt-1">Each ticket = one chance</div>
              </div>
            </div>

            <div className="text-gray-500 text-xs animate-pulse tracking-widest uppercase">
              ✦ Shuffling all tickets... ✦
            </div>
          </div>
        )}

        {/* ══════════ CHAOS ══════════ */}
        {phase === 'chaos' && (
          <div className={`flex flex-col items-center gap-6 w-full max-w-sm text-center ${chaosGlitch ? 'edc-glitch' : ''}`}>
            <div
              className="text-yellow-400 text-xs font-black tracking-[0.5em] uppercase animate-pulse"
              style={{ textShadow: '0 0 14px rgba(255,215,0,0.9)' }}
            >
              ⚡ DRAW IN PROGRESS ⚡
            </div>

            {/* Slot machine */}
            <div
              className="relative w-full rounded-2xl overflow-hidden border-2 border-yellow-500/60 edc-glow-box"
              style={{ background: 'rgba(255,215,0,0.04)' }}
            >
              <div className="absolute left-0 inset-y-0 w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-80" />
              <div className="absolute right-0 inset-y-0 w-1 bg-gradient-to-b from-transparent via-yellow-400 to-transparent opacity-80" />
              {/* Center band */}
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-14 bg-yellow-400/10 border-y border-yellow-500/40" />
              {/* Top/bottom masks */}
              <div className="absolute inset-x-0 top-0 h-6 bg-gradient-to-b from-black/80 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/80 to-transparent" />

              <div className="py-9 flex flex-col items-center">
                <div className="text-white/20 text-sm font-mono h-5">• • •</div>
                <div
                  key={nameKey}
                  className="text-yellow-300 text-2xl font-mono font-black tracking-wider edc-slot-fast"
                  style={{ textShadow: '0 0 22px rgba(255,215,0,1)' }}
                >
                  {currentName || 'LuckyPlayer'}
                </div>
                <div className="text-white/20 text-sm font-mono h-5">• • •</div>
              </div>
            </div>

            <div className="text-gray-500 text-xs tracking-wider">
              {playerCount} players • {totalTix} tickets
            </div>
          </div>
        )}

        {/* ══════════ TENSION ══════════ */}
        {phase === 'tension' && (
          <div className="flex flex-col items-center gap-6 w-full max-w-sm text-center">
            <div
              className="text-yellow-500/90 text-xs font-black tracking-[0.45em] uppercase"
              style={{ textShadow: '0 0 10px rgba(255,215,0,0.5)' }}
            >
              FATE DECIDES...
            </div>

            <div
              className={`relative w-full rounded-2xl overflow-hidden border-2 ${heartbeat ? 'border-yellow-300 edc-heartbeat' : 'border-yellow-500/70'}`}
              style={{
                background: 'rgba(255,215,0,0.06)',
                boxShadow: heartbeat
                  ? '0 0 55px rgba(255,215,0,0.6), inset 0 0 30px rgba(255,215,0,0.06)'
                  : '0 0 22px rgba(255,215,0,0.22)',
              }}
            >
              <div className="py-12 flex flex-col items-center gap-3">
                <div
                  key={nameKey}
                  className="text-yellow-100 text-3xl font-mono font-black tracking-wider edc-slot-in"
                  style={{ textShadow: '0 0 36px rgba(255,215,0,1)' }}
                >
                  {currentName || 'GoldRush_Tim'}
                </div>
                {heartbeat && (
                  <div className="text-red-400 text-2xl" style={{ animation: 'edc-heartbeat 0.85s ease-in-out infinite' }}>
                    💓
                  </div>
                )}
              </div>
            </div>

            <div className="text-gray-600 text-xs italic tracking-wide">
              "Fate is revealing its choice..."
            </div>
          </div>
        )}

        {/* ══════════ SUSPENSE ══════════ */}
        {phase === 'suspense' && (
          <div className="flex flex-col items-center gap-5 w-full max-w-sm text-center">
            <div
              className="text-yellow-400 font-black text-lg tracking-[0.25em] uppercase"
              style={{ textShadow: '0 0 22px rgba(255,215,0,0.7)' }}
            >
              🎯 THE 3 FINALISTS 🎯
            </div>

            <div className="w-full flex flex-col gap-3">
              {finalists.map((name, i) => {
                const isActive = activeFinalist === i;
                const isMe = name === (userUsername || (userAddress ? shortAddr(userAddress) : null));
                return (
                  <div
                    key={i}
                    className={`relative w-full rounded-xl px-5 py-4 border-2 transition-all duration-500 ${
                      isActive
                        ? 'border-yellow-400 edc-finalist-hl scale-[1.05]'
                        : 'border-white/10 opacity-30 scale-100'
                    }`}
                    style={{
                      background: isActive ? 'rgba(255,215,0,0.12)' : 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div
                      className={`font-mono text-xl font-black ${isActive ? 'text-yellow-200' : 'text-gray-600'}`}
                      style={isActive ? { textShadow: '0 0 18px rgba(255,215,0,0.9)' } : {}}
                    >
                      {name || '???'}
                      {isMe && isActive && <span className="ml-2 text-indigo-300 text-sm">← YOU</span>}
                    </div>
                    {isActive && (
                      <span className="absolute -top-3 right-3 bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full tracking-widest">
                        IN PLAY
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="text-gray-500 text-xs animate-pulse tracking-widest uppercase mt-1">
              Who will it be?
            </div>
          </div>
        )}

        {/* ══════════ REVELATION ══════════ */}
        {phase === 'revelation' && (
          <div className="flex flex-col items-center gap-5 w-full max-w-sm text-center">
            {showWinnerBadge && (
              <div
                className="bg-gradient-to-r from-yellow-400 via-fuchsia-400 to-red-500 text-black font-black text-xl px-8 py-3 rounded-full edc-badge-pop"
                style={{ boxShadow: '0 0 50px rgba(255,215,0,0.9), 0 0 100px rgba(255,107,0,0.4)' }}
              >
                🎉 IT&apos;S YOU! 🎉
              </div>
            )}

            <div
              className="text-7xl edc-crown"
              style={{ filter: 'drop-shadow(0 0 28px rgba(255,215,0,1))' }}
            >
              🏆
            </div>

            <div>
              <div className="text-yellow-500/70 text-[10px] font-black tracking-[0.7em] uppercase mb-3">
                WINNER
              </div>
              <div
                className="text-white text-3xl font-mono font-black tracking-wider edc-prize-pop"
                style={{ textShadow: '0 0 35px rgba(255,215,0,1)' }}
              >
                {winnerDisplay}
              </div>
              {winnerUsername && (
                <div className="text-gray-500 text-xs font-mono mt-1">{shortAddr(winner)}</div>
              )}
            </div>

            {/* Prize counter */}
            <div className="edc-prize-pop" style={{ animationDelay: '0.4s' }}>
              <div className="text-gray-400 text-xs mb-1 tracking-widest uppercase">Prize</div>
              <div
                className="text-5xl font-black tabular-nums"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF8C00 50%, #FFD700 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                ${displayedPrize.toLocaleString('en-US')}
              </div>
            </div>

            {isUserWinner && (
              <div
                className="w-full rounded-xl p-3 border border-yellow-400/40 text-yellow-200 text-sm edc-prize-pop"
                style={{ background: 'rgba(255,215,0,0.07)', animationDelay: '0.8s' }}
              >
                💰 USDC funds will be sent to your wallet within 24 hours.
              </div>
            )}

            <div className="flex gap-3 flex-wrap justify-center edc-prize-pop" style={{ animationDelay: '1s' }}>
              <button
                onClick={() => {
                  const text = `🏆 ${winnerDisplay} wins $${prize.toLocaleString('en-US')} USDC on Aureus! Try your luck at aureus.app`;
                  window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="px-4 py-2 bg-black border border-white/25 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                Share on X
              </button>
              <button
                onClick={() => { if (!completedRef.current) { completedRef.current = true; onCompleteRef.current(); } }}
                className="px-4 py-2 rounded-xl text-sm font-semibold border border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/15 transition-colors"
                style={{ background: 'rgba(255,215,0,0.07)' }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Phase dots */}
        <div className="absolute bottom-5 flex gap-2 items-center">
          {PHASE_ORDER.map(p => {
            const idx = PHASE_ORDER.indexOf(p);
            const cur = PHASE_ORDER.indexOf(phase);
            return (
              <div
                key={p}
                className="rounded-full transition-all duration-500"
                style={{
                  width: idx === cur ? '22px' : '7px',
                  height: '7px',
                  background: idx < cur ? 'rgba(255,215,0,0.5)' : idx === cur ? '#FFD700' : 'rgba(255,255,255,0.15)',
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
