import { useState } from 'react';

type Tab = 'channels' | 'heatmap';

interface Channel {
  slug: string;
  name: string;
  description: string;
  channel_type: string;
  icon: string;
  post_count: number;
}

const MOCK_CHANNELS: Channel[] = [
  { slug: 'general', name: 'General Discussion', description: 'Anything gig driving related', channel_type: 'general', icon: '💬', post_count: 247 },
  { slug: 'uber', name: 'Uber Drivers', description: 'Tips, issues, and strategies for Uber', channel_type: 'platform', icon: '🚗', post_count: 182 },
  { slug: 'lyft', name: 'Lyft Drivers', description: 'All things Lyft', channel_type: 'platform', icon: '🚗', post_count: 98 },
  { slug: 'doordash', name: 'DoorDash Dashers', description: 'Food delivery discussion', channel_type: 'platform', icon: '🍔', post_count: 156 },
  { slug: 'instacart', name: 'Instacart Shoppers', description: 'Grocery delivery talk', channel_type: 'platform', icon: '🛒', post_count: 72 },
  { slug: 'amazon-flex', name: 'Amazon Flex', description: 'Package delivery discussion', channel_type: 'platform', icon: '📦', post_count: 45 },
  { slug: 'vehicle-maintenance', name: 'Vehicle Maintenance', description: 'Repair tips and DIY guides', channel_type: 'topic', icon: '🔧', post_count: 134 },
  { slug: 'tax-deductions', name: 'Tax & Deductions', description: 'Maximize your deductions', channel_type: 'topic', icon: '💰', post_count: 89 },
  { slug: 'new-drivers', name: 'New Driver Advice', description: 'Getting started with gig driving', channel_type: 'topic', icon: '🆕', post_count: 63 },
  { slug: 'market-talk', name: 'Market Talk', description: 'Best times, areas, and strategies by city', channel_type: 'market', icon: '📍', post_count: 201 },
];

const MOCK_POSTS = [
  { id: 1, title: 'Best time to drive in LA on weekends?', body: 'I\'ve been driving for 3 months and weekends are hit or miss...', display_name: 'Mike R.', upvotes: 24, reply_count: 18, gig_platform: 'uber', city: 'Los Angeles', created_at: '2h ago' },
  { id: 2, title: 'Oil change interval for high-mileage Camry?', body: 'I have 120k miles on my 2019 Camry. Should I stick with 5k mile intervals?', display_name: 'Sarah K.', upvotes: 15, reply_count: 12, gig_platform: null, city: null, created_at: '5h ago' },
  { id: 3, title: 'DoorDash hiding tips again...', body: 'Anyone else noticing lower payouts this week?', display_name: 'Chris T.', upvotes: 42, reply_count: 31, gig_platform: 'doordash', city: null, created_at: '8h ago' },
  { id: 4, title: 'Just hit 100k miles doing Uber — AMA', body: 'Started in 2023 with a Prius. Happy to share what I\'ve learned.', display_name: 'James L.', upvotes: 67, reply_count: 45, gig_platform: 'uber', city: 'Chicago', created_at: '1d ago' },
  { id: 5, title: 'Tax write-off: Can I deduct car washes?', body: 'I get my car detailed weekly for rideshare. Is this deductible?', display_name: 'Ana P.', upvotes: 19, reply_count: 8, gig_platform: null, city: null, created_at: '1d ago' },
];

const HEATMAP_LEVELS: Record<string, { color: string; label: string }> = {
  very_high: { color: '#ff00aa', label: 'Peak' },
  high: { color: '#ffaa00', label: 'High' },
  medium: { color: '#00f0ff', label: 'Medium' },
  low: { color: '#2a2a3e', label: 'Low' },
  very_low: { color: '#12121a', label: 'Dead' },
};

function DemandHeatmap() {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  function getLevel(day: number, hour: number): string {
    const isWeekend = day === 0 || day === 5 || day === 6;
    const isMorningRush = hour >= 7 && hour <= 9;
    const isEveningRush = hour >= 17 && hour <= 20;
    const isLateNight = hour >= 22 || hour <= 4;
    const isLunchRush = hour >= 11 && hour <= 13;

    if (isWeekend && (isEveningRush || isLateNight)) return 'very_high';
    if (isEveningRush || (isWeekend && isLunchRush)) return 'high';
    if (isMorningRush || isLunchRush) return 'medium';
    if (isLateNight && !isWeekend) return 'medium';
    if (hour >= 5 && hour <= 22) return 'low';
    return 'very_low';
  }

  function formatHour(h: number): string {
    if (h === 0) return '12a';
    if (h === 12) return '12p';
    return h < 12 ? `${h}a` : `${h - 12}p`;
  }

  return (
    <div className="glass-card p-5 animate-fade-in-up">
      <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
        Demand Heatmap — Best Times to Drive
      </h3>
      <p className="text-xs text-noir-muted mb-4">
        Based on estimated demand patterns. Community data improves accuracy over time.
      </p>

      {/* Legend */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {Object.entries(HEATMAP_LEVELS).map(([key, { color, label }]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
            <span className="text-[10px] text-noir-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Hour labels */}
          <div className="flex items-center mb-1">
            <div className="w-10 shrink-0" />
            {hours.filter((h) => h % 3 === 0).map((h) => (
              <div key={h} className="text-[9px] text-noir-muted text-center" style={{ width: `${100/8}%` }}>
                {formatHour(h)}
              </div>
            ))}
          </div>

          {/* Day rows */}
          {days.map((dayName, dayIdx) => (
            <div key={dayName} className="flex items-center mb-0.5">
              <div className="w-10 text-[10px] text-noir-muted shrink-0 font-medium">{dayName}</div>
              <div className="flex-1 flex gap-px">
                {hours.map((hour) => {
                  const level = getLevel(dayIdx, hour);
                  const { color } = HEATMAP_LEVELS[level];
                  return (
                    <div
                      key={hour}
                      className="flex-1 h-5 rounded-sm transition-all hover:scale-y-125 cursor-pointer"
                      style={{
                        backgroundColor: color,
                        boxShadow: level === 'very_high' ? `0 0 6px ${color}60` : undefined,
                      }}
                      title={`${dayName} ${formatHour(hour)}: ${HEATMAP_LEVELS[level].label} demand`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-noir-border/50 flex items-center gap-4">
        <p className="text-xs text-neon-amber flex-1">
          Peak earnings: Fri-Sat evenings (5-10 PM) and late night (10 PM - 2 AM)
        </p>
        <button className="text-xs text-neon-cyan hover:underline">Share your data</button>
      </div>
    </div>
  );
}

export default function ForumPage() {
  const [activeTab, setActiveTab] = useState<Tab>('channels');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const channelTypes = ['platform', 'topic', 'market', 'general'];

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <header className="mb-8 stagger">
          <p className="animate-fade-in-up text-xs font-medium uppercase tracking-[0.3em] text-neon-cyan/60 mb-3 font-[family-name:var(--font-display)]">
            Driver Forum
          </p>
          <h1 className="animate-fade-in-up text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text">
            Connect & Share
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-sm mt-2">
            Discuss strategies, share tips, and find the best times to drive.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => { setActiveTab('channels'); setSelectedChannel(null); }}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'channels' ? 'glass-card neon-border-cyan text-neon-cyan' : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'
            }`}
          >
            Forum
          </button>
          <button
            onClick={() => setActiveTab('heatmap')}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'heatmap' ? 'glass-card neon-border-cyan text-neon-cyan' : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'
            }`}
          >
            Demand Heatmap
          </button>
        </div>

        {activeTab === 'heatmap' ? (
          <DemandHeatmap />
        ) : selectedChannel ? (
          /* Channel post list */
          <div className="space-y-3">
            <button
              onClick={() => setSelectedChannel(null)}
              className="flex items-center gap-2 text-xs text-noir-muted hover:text-neon-cyan transition-colors mb-4"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to channels
            </button>

            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-noir-text">
                {MOCK_CHANNELS.find((c) => c.slug === selectedChannel)?.icon}{' '}
                {MOCK_CHANNELS.find((c) => c.slug === selectedChannel)?.name}
              </h2>
              <button className="neon-btn neon-btn-cyan text-xs !py-2 !px-4">New Post</button>
            </div>

            <div className="space-y-2 stagger">
              {MOCK_POSTS.map((post) => (
                <div key={post.id} className="glass-card p-4 glass-card-hover cursor-pointer animate-fade-in-up">
                  <div className="flex gap-3">
                    {/* Vote column */}
                    <div className="flex flex-col items-center gap-1 shrink-0 w-8">
                      <button className="text-noir-muted hover:text-neon-green transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <span className="text-xs font-mono font-bold text-neon-cyan">{post.upvotes}</span>
                      <button className="text-noir-muted hover:text-neon-magenta transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-noir-text mb-1">{post.title}</h3>
                      <p className="text-xs text-noir-text-secondary line-clamp-2">{post.body}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className="text-[10px] text-noir-muted">by {post.display_name}</span>
                        <span className="text-[10px] text-noir-muted">{post.created_at}</span>
                        <span className="text-[10px] text-noir-muted">{post.reply_count} replies</span>
                        {post.gig_platform && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan">{post.gig_platform}</span>
                        )}
                        {post.city && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-amber/10 text-neon-amber">{post.city}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Channel list */
          <div className="space-y-6 stagger">
            {channelTypes.map((type) => {
              const channels = MOCK_CHANNELS.filter((c) => c.channel_type === type);
              if (channels.length === 0) return null;

              const typeLabels: Record<string, string> = {
                platform: 'By Platform',
                topic: 'Topics',
                market: 'Markets',
                general: 'General',
              };

              return (
                <div key={type} className="animate-fade-in-up">
                  <h3 className="text-xs text-noir-muted uppercase tracking-wider mb-2 font-[family-name:var(--font-display)]">
                    {typeLabels[type]}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {channels.map((ch) => (
                      <button
                        key={ch.slug}
                        onClick={() => setSelectedChannel(ch.slug)}
                        className="glass-card glass-card-hover p-4 text-left transition-all flex items-center gap-3"
                      >
                        <span className="text-2xl">{ch.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-noir-text">{ch.name}</span>
                            <span className="text-[10px] font-mono text-noir-muted">{ch.post_count}</span>
                          </div>
                          <p className="text-xs text-noir-text-secondary truncate">{ch.description}</p>
                        </div>
                        <svg className="w-4 h-4 text-noir-muted shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
