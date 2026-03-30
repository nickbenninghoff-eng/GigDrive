const BADGE_INFO: Record<string, { name: string; icon: string; description: string }> = {
  first_report: { name: 'First Report', icon: '🔧', description: 'Submitted your first repair report' },
  first_tip: { name: 'First Tip', icon: '💡', description: 'Shared your first driver tip' },
  streak_7: { name: '7-Day Streak', icon: '🔥', description: '7 consecutive days of contributions' },
  streak_30: { name: '30-Day Streak', icon: '🔥', description: '30 days of contributions' },
  helpful_10: { name: 'Helpful', icon: '👍', description: 'Received 10 upvotes' },
  helpful_100: { name: 'Super Helpful', icon: '⭐', description: 'Received 100 upvotes' },
  data_pioneer: { name: 'Data Pioneer', icon: '🚩', description: 'First report for a vehicle model' },
  top_weekly: { name: 'Weekly Champion', icon: '🏆', description: '#1 on the weekly leaderboard' },
  gas_scout: { name: 'Gas Scout', icon: '⛽', description: 'Reported 10 gas prices' },
  fleet_expert: { name: 'Fleet Expert', icon: '🚗', description: 'Reports on 5+ vehicles' },
};

interface BadgeDisplayProps {
  earnedBadges: string[];
  compact?: boolean;
}

export default function BadgeDisplay({ earnedBadges, compact = false }: BadgeDisplayProps) {
  const allBadges = Object.entries(BADGE_INFO);

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1.5">
        {allBadges.map(([type, info]) => {
          const earned = earnedBadges.includes(type);
          return (
            <div
              key={type}
              title={`${info.name}: ${info.description}`}
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                earned
                  ? 'bg-neon-cyan/10 shadow-[0_0_8px_var(--color-neon-cyan-glow)]'
                  : 'bg-noir-surface opacity-30 grayscale'
              }`}
            >
              {info.icon}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {allBadges.map(([type, info]) => {
        const earned = earnedBadges.includes(type);
        return (
          <div
            key={type}
            className={`glass-card p-3 text-center transition-all ${
              earned ? 'glass-card-hover' : 'opacity-40 grayscale'
            }`}
          >
            <span className="text-2xl block mb-1.5">{info.icon}</span>
            <p className="text-[10px] font-semibold text-noir-text leading-tight">{info.name}</p>
            <p className="text-[9px] text-noir-muted mt-0.5 leading-tight">{info.description}</p>
          </div>
        );
      })}
    </div>
  );
}
