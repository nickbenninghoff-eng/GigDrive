import { useState } from 'react';
import { formatCurrency } from '../utils/formatCurrency';
import Leaderboard from '../components/gamification/Leaderboard';
import BadgeDisplay from '../components/gamification/BadgeDisplay';

type Tab = 'repairs' | 'tips' | 'leaderboard';

interface MockRepairReport {
  id: number;
  service_type: string;
  amount_cents: number;
  year: number;
  make: string;
  model: string;
  shop_type: string;
  display_name: string;
  upvotes: number;
  downvotes: number;
  description: string;
  created_at: string;
}

const MOCK_REPAIRS: MockRepairReport[] = [
  { id: 1, service_type: 'Oil Change', amount_cents: 7500, year: 2023, make: 'Toyota', model: 'Camry', shop_type: 'independent', display_name: 'Mike R.', upvotes: 12, downvotes: 1, description: 'Full synthetic at a local shop. Quick and affordable.', created_at: '2026-03-25' },
  { id: 2, service_type: 'Brake Pads', amount_cents: 28000, year: 2022, make: 'Honda', model: 'Civic', shop_type: 'chain', display_name: 'Sarah K.', upvotes: 8, downvotes: 0, description: 'Front brake pads replaced at Midas. Includes labor.', created_at: '2026-03-22' },
  { id: 3, service_type: 'Tire Rotation', amount_cents: 3500, year: 2023, make: 'Toyota', model: 'Prius', shop_type: 'dealer', display_name: 'James L.', upvotes: 5, downvotes: 2, description: 'Dealer charged more than expected but included inspection.', created_at: '2026-03-20' },
  { id: 4, service_type: 'Oil Change', amount_cents: 4500, year: 2023, make: 'Hyundai', model: 'Elantra', shop_type: 'diy', display_name: 'Chris T.', upvotes: 15, downvotes: 0, description: 'DIY with Mobil 1 from Walmart. 20 minutes.', created_at: '2026-03-18' },
  { id: 5, service_type: 'New Tires', amount_cents: 52000, year: 2023, make: 'Toyota', model: 'Camry', shop_type: 'chain', display_name: 'Ana P.', upvotes: 6, downvotes: 1, description: 'Set of 4 Michelin Defenders from Discount Tire.', created_at: '2026-03-15' },
];

const MOCK_TIPS = [
  { id: 1, title: 'Best synthetic oil for high-mileage Camrys', body: 'Mobil 1 High Mileage 0W-20 works great. I get it at Walmart for $28/5qt.', vehicle_make: 'Toyota', gig_platform: 'uber', display_name: 'Mike R.', upvotes: 24, downvotes: 2, created_at: '2026-03-24' },
  { id: 2, title: 'Track every gas fill-up for taxes', body: 'Use the GigDrive expense tracker. At the end of the year you can compare standard mileage vs actual deduction.', vehicle_make: null, gig_platform: null, display_name: 'Sarah K.', upvotes: 18, downvotes: 0, created_at: '2026-03-22' },
  { id: 3, title: 'Costco tires are the best deal', body: 'Costco includes free rotations, balancing, and flat repair for life of the tire. Worth the membership.', vehicle_make: null, gig_platform: null, display_name: 'Chris T.', upvotes: 31, downvotes: 1, created_at: '2026-03-20' },
];

const SHOP_BADGES: Record<string, { label: string; color: string }> = {
  dealer: { label: 'Dealer', color: 'bg-neon-amber/15 text-neon-amber' },
  independent: { label: 'Independent', color: 'bg-neon-cyan/15 text-neon-cyan' },
  chain: { label: 'Chain', color: 'bg-neon-purple/15 text-neon-purple' },
  diy: { label: 'DIY', color: 'bg-neon-green/15 text-neon-green' },
};

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<Tab>('repairs');

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <header className="mb-8 stagger">
          <p className="animate-fade-in-up text-xs font-medium uppercase tracking-[0.3em] text-neon-magenta/60 mb-3 font-[family-name:var(--font-display)]">
            Driver Community
          </p>
          <h1 className="animate-fade-in-up text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text">
            Real Costs from Real Drivers
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-sm mt-2">
            Crowdsourced repair costs and tips from the gig driving community.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('repairs')}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'repairs'
                ? 'glass-card neon-border-cyan text-neon-cyan'
                : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'
            }`}
          >
            Repair Reports
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'tips'
                ? 'glass-card neon-border-cyan text-neon-cyan'
                : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'
            }`}
          >
            Driver Tips
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-5 py-2.5 text-sm font-medium rounded-xl transition-all ${
              activeTab === 'leaderboard'
                ? 'glass-card neon-border-cyan text-neon-cyan'
                : 'bg-noir-surface/50 text-noir-muted hover:text-noir-text'
            }`}
          >
            Leaderboard
          </button>
        </div>

        {activeTab === 'repairs' ? (
          <div className="space-y-3 stagger">
            {MOCK_REPAIRS.map((report) => {
              const shopBadge = SHOP_BADGES[report.shop_type];
              return (
                <div key={report.id} className="glass-card p-5 animate-fade-in-up">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-sm font-semibold text-noir-text">{report.service_type}</span>
                        <span className="text-xs text-noir-muted">on</span>
                        <span className="text-sm text-neon-cyan">{report.year} {report.make} {report.model}</span>
                        {shopBadge && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${shopBadge.color}`}>
                            {shopBadge.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-noir-text-secondary mt-1">{report.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs text-noir-muted">by {report.display_name}</span>
                        <span className="text-xs text-noir-muted">{report.created_at}</span>
                        <div className="flex items-center gap-2">
                          <button className="flex items-center gap-1 text-xs text-noir-muted hover:text-neon-green transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                            {report.upvotes}
                          </button>
                          <button className="flex items-center gap-1 text-xs text-noir-muted hover:text-neon-magenta transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                            {report.downvotes}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-bold font-mono text-neon-green">
                        {formatCurrency(report.amount_cents / 100)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}

            <div className="glass-card p-5 text-center">
              <p className="text-sm text-noir-text-secondary mb-3">Have a repair cost to share?</p>
              <button className="neon-btn neon-btn-cyan text-sm">Submit a Report</button>
            </div>
          </div>
        ) : activeTab === 'tips' ? (
          <div className="space-y-3 stagger">
            {MOCK_TIPS.map((tip) => (
              <div key={tip.id} className="glass-card p-5 animate-fade-in-up">
                <h3 className="text-sm font-semibold text-noir-text mb-1">{tip.title}</h3>
                <p className="text-sm text-noir-text-secondary">{tip.body}</p>
                <div className="flex items-center gap-4 mt-3 flex-wrap">
                  <span className="text-xs text-noir-muted">by {tip.display_name}</span>
                  {tip.vehicle_make && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan">{tip.vehicle_make}</span>
                  )}
                  {tip.gig_platform && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-neon-amber/10 text-neon-amber">{tip.gig_platform}</span>
                  )}
                  <div className="flex items-center gap-1 text-xs text-noir-muted">
                    <svg className="w-3.5 h-3.5 text-neon-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    {tip.upvotes}
                  </div>
                </div>
              </div>
            ))}

            <div className="glass-card p-5 text-center">
              <p className="text-sm text-noir-text-secondary mb-3">Got a tip for fellow drivers?</p>
              <button className="neon-btn neon-btn-cyan text-sm">Share a Tip</button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 stagger">
            <Leaderboard />

            <div className="glass-card p-5 animate-fade-in-up">
              <h3 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
                All Badges
              </h3>
              <BadgeDisplay earnedBadges={['first_report', 'first_tip', 'streak_7', 'helpful_10']} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
