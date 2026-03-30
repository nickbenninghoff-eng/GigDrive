import { useState } from 'react';

interface LeaderEntry {
  rank: number;
  displayName: string;
  reputationScore: number;
  reports: number;
  tips: number;
  streak: number;
  badges: number;
}

const MOCK_LEADERS: LeaderEntry[] = [
  { rank: 1, displayName: 'Mike R.', reputationScore: 1250, reports: 48, tips: 12, streak: 23, badges: 7 },
  { rank: 2, displayName: 'Sarah K.', reputationScore: 980, reports: 35, tips: 18, streak: 15, badges: 6 },
  { rank: 3, displayName: 'Chris T.', reputationScore: 840, reports: 42, tips: 5, streak: 8, badges: 5 },
  { rank: 4, displayName: 'Ana P.', reputationScore: 720, reports: 28, tips: 8, streak: 12, badges: 4 },
  { rank: 5, displayName: 'James L.', reputationScore: 650, reports: 22, tips: 10, streak: 5, badges: 4 },
  { rank: 6, displayName: 'Taylor M.', reputationScore: 520, reports: 18, tips: 6, streak: 3, badges: 3 },
  { rank: 7, displayName: 'Jordan W.', reputationScore: 410, reports: 15, tips: 4, streak: 7, badges: 3 },
  { rank: 8, displayName: 'Casey B.', reputationScore: 350, reports: 12, tips: 3, streak: 2, badges: 2 },
];

export default function Leaderboard() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');

  return (
    <div className="glass-card overflow-hidden animate-fade-in-up">
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-center justify-between">
        <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)]">
          Top Contributors
        </h3>
        <div className="flex gap-1 bg-noir-surface rounded-lg p-0.5">
          {(['weekly', 'monthly', 'alltime'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2.5 py-1 text-[10px] rounded-md transition-all ${
                period === p ? 'bg-neon-cyan/15 text-neon-cyan' : 'text-noir-muted hover:text-noir-text'
              }`}
            >
              {p === 'alltime' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="px-5 pb-5">
        <div className="space-y-1">
          {MOCK_LEADERS.map((leader) => (
            <div
              key={leader.rank}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                leader.rank <= 3 ? 'bg-noir-surface/50' : 'hover:bg-noir-surface/30'
              }`}
            >
              {/* Rank */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-[family-name:var(--font-display)] ${
                leader.rank === 1 ? 'bg-neon-amber/15 text-neon-amber' :
                leader.rank === 2 ? 'bg-noir-card text-noir-text' :
                leader.rank === 3 ? 'bg-noir-card text-noir-text-secondary' :
                'text-noir-muted'
              }`}>
                {leader.rank}
              </div>

              {/* Name + badges */}
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-noir-text truncate block">
                  {leader.displayName}
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[10px] text-noir-muted">{leader.reports} reports</span>
                  <span className="text-[10px] text-noir-muted">{leader.tips} tips</span>
                  {leader.streak > 0 && (
                    <span className="text-[10px] text-neon-amber">🔥 {leader.streak}d</span>
                  )}
                </div>
              </div>

              {/* Reputation score */}
              <div className="text-right shrink-0">
                <span className="text-sm font-bold font-mono text-neon-cyan">
                  {leader.reputationScore.toLocaleString()}
                </span>
                <span className="text-[10px] text-noir-muted block">rep</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
