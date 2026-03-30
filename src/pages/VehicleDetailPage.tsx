import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

interface VehicleDetail {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  fuel_type: string;
  mpg_city: number | null;
  mpg_highway: number | null;
  mpg_combined: number | null;
  body_style: string | null;
  cargo_volume_cuft: number | null;
  passenger_capacity: number | null;
  msrp_original: number | null;
  nhtsa_overall_safety_rating: number | null;
  nhtsa_complaint_count: number | null;
  gig_scores: Array<{
    gig_category: string;
    overall_score: number;
    cost_score: number;
    comfort_score: number;
    cargo_score: number;
    reliability_score: number;
  }>;
  maintenance: Array<{
    service_type: string;
    interval_miles: number | null;
    interval_months: number | null;
    estimated_cost_low: number | null;
    estimated_cost_high: number | null;
  }>;
}

const GIG_LABELS: Record<string, { label: string; icon: string }> = {
  rideshare: { label: 'Rideshare', icon: '🚗' },
  food_delivery: { label: 'Food Delivery', icon: '🍔' },
  grocery: { label: 'Grocery', icon: '🛒' },
  package: { label: 'Package', icon: '📦' },
};

function ScoreCircle({ score, label, color, size = 'md' }: { score: number; label: string; color: string; size?: 'sm' | 'md' }) {
  const pct = (score / 10) * 100;
  const dim = size === 'sm' ? 56 : 72;
  const r = size === 'sm' ? 22 : 28;
  const circ = r * 2 * Math.PI;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: dim, height: dim }}>
        <svg className="-rotate-90" width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`}>
          <circle cx={dim / 2} cy={dim / 2} r={r} fill="none" stroke="#2a2a3e" strokeWidth={size === 'sm' ? 3 : 4} />
          <circle
            cx={dim / 2} cy={dim / 2} r={r} fill="none"
            stroke={color}
            strokeWidth={size === 'sm' ? 3 : 4}
            strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circ} ${circ}`}
            style={{ filter: `drop-shadow(0 0 4px ${color}40)`, transition: 'stroke-dasharray 0.7s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`font-bold font-mono ${size === 'sm' ? 'text-sm' : 'text-lg'}`} style={{ color }}>
            {score.toFixed(1)}
          </span>
        </div>
      </div>
      <span className="text-[10px] text-noir-muted text-center">{label}</span>
    </div>
  );
}

function SpecRow({ label, value }: { label: string; value: string | number | null }) {
  if (value === null || value === undefined) return null;
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-noir-border/50 last:border-0">
      <span className="text-sm text-noir-text-secondary">{label}</span>
      <span className="text-sm font-medium font-mono text-noir-text">{value}</span>
    </div>
  );
}

export default function VehicleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [vehicle, setVehicle] = useState<VehicleDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/v1/vehicles/${id}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => setVehicle(data))
      .catch(() => setVehicle(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="px-4 py-12 max-w-4xl mx-auto">
        <div className="glass-card p-8 animate-pulse space-y-4">
          <div className="h-8 bg-noir-border rounded w-1/3" />
          <div className="h-4 bg-noir-border rounded w-1/2" />
          <div className="h-32 bg-noir-border rounded" />
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="px-4 py-12 max-w-4xl mx-auto text-center">
        <div className="glass-card p-8">
          <p className="text-noir-muted text-lg mb-4">Vehicle not found</p>
          <Link to="/rankings" className="neon-btn neon-btn-cyan text-sm no-underline">
            Back to Rankings
          </Link>
        </div>
      </div>
    );
  }

  const bestGigScore = vehicle.gig_scores?.length
    ? vehicle.gig_scores.reduce((a, b) => (a.overall_score > b.overall_score ? a : b))
    : null;

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <nav className="mb-6 animate-fade-in">
          <Link to="/rankings" className="text-xs text-noir-muted hover:text-neon-cyan transition-colors no-underline">
            Rankings
          </Link>
          <span className="text-xs text-noir-border mx-2">/</span>
          <span className="text-xs text-noir-text-secondary">
            {vehicle.year} {vehicle.make} {vehicle.model}
          </span>
        </nav>

        {/* Hero header */}
        <header className="glass-card p-6 mb-6 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold font-[family-name:var(--font-display)] text-noir-text">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              {vehicle.trim && (
                <p className="text-sm text-noir-muted mt-1">{vehicle.trim}</p>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                {vehicle.fuel_type === 'electric' && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-neon-green/15 text-neon-green font-medium">Electric</span>
                )}
                {vehicle.body_style && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-noir-card text-noir-text-secondary">
                    {vehicle.body_style.replace(/_/g, ' ')}
                  </span>
                )}
                {bestGigScore && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-neon-cyan/10 text-neon-cyan">
                    Best for {GIG_LABELS[bestGigScore.gig_category]?.label || bestGigScore.gig_category}
                  </span>
                )}
              </div>
            </div>

            {/* Big safety stars */}
            {vehicle.nhtsa_overall_safety_rating && (
              <div className="text-center shrink-0">
                <div className="text-2xl tracking-wider" style={{ filter: 'drop-shadow(0 0 4px #39ff1440)' }}>
                  {'★'.repeat(vehicle.nhtsa_overall_safety_rating)}
                  <span className="text-noir-border">{'★'.repeat(5 - vehicle.nhtsa_overall_safety_rating)}</span>
                </div>
                <p className="text-[10px] text-noir-muted uppercase tracking-wider mt-1">NHTSA Safety</p>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Specs */}
          <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
            <h2 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
              Specifications
            </h2>
            <SpecRow label="MPG City" value={vehicle.mpg_city} />
            <SpecRow label="MPG Highway" value={vehicle.mpg_highway} />
            <SpecRow label="MPG Combined" value={vehicle.mpg_combined} />
            <SpecRow label="Fuel Type" value={vehicle.fuel_type} />
            <SpecRow label="Passengers" value={vehicle.passenger_capacity} />
            <SpecRow label="Cargo (cu ft)" value={vehicle.cargo_volume_cuft} />
            <SpecRow label="MSRP" value={vehicle.msrp_original ? formatCurrency(vehicle.msrp_original) : null} />
            <SpecRow label="Complaints" value={vehicle.nhtsa_complaint_count} />
          </div>

          {/* Gig Scores */}
          <div className="glass-card p-5 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            <h2 className="text-sm font-medium text-noir-text-secondary uppercase tracking-wider font-[family-name:var(--font-display)] mb-4">
              Gig Suitability Scores
            </h2>

            {vehicle.gig_scores?.length ? (
              <div className="space-y-6">
                {vehicle.gig_scores.map((gs) => (
                  <div key={gs.gig_category}>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{GIG_LABELS[gs.gig_category]?.icon}</span>
                      <span className="text-sm font-semibold text-noir-text">
                        {GIG_LABELS[gs.gig_category]?.label || gs.gig_category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 overflow-x-auto pb-1">
                      <ScoreCircle score={gs.overall_score} label="Overall" color="#00f0ff" size="sm" />
                      <ScoreCircle score={gs.cost_score} label="Cost" color="#39ff14" size="sm" />
                      <ScoreCircle score={gs.reliability_score} label="Reliable" color="#ffaa00" size="sm" />
                      <ScoreCircle score={gs.comfort_score} label="Comfort" color="#bf00ff" size="sm" />
                      <ScoreCircle score={gs.cargo_score} label="Cargo" color="#ff00aa" size="sm" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-noir-muted text-sm">
                Gig scores not yet computed. Run the scoring script.
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-6 glass-card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          <p className="text-sm text-noir-text-secondary">
            Want to know what this vehicle costs you per mile?
          </p>
          <Link
            to={`/?vehicle=${vehicle.id}`}
            className="neon-btn neon-btn-cyan text-sm no-underline whitespace-nowrap"
          >
            Calculate CPM
          </Link>
        </div>
      </div>
    </div>
  );
}
