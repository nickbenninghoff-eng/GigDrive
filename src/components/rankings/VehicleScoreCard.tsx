import { Link } from 'react-router-dom';
import type { RankedVehicle } from '../../api/rankings';
import { formatCurrency } from '../../utils/formatCurrency';

interface VehicleScoreCardProps {
  vehicle: RankedVehicle;
  rank: number;
}

function ScoreBar({ label, score, color }: { label: string; score: number; color: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-noir-muted w-16 shrink-0">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-noir-border overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${(score / 10) * 100}%`,
            backgroundColor: color,
            boxShadow: `0 0 6px ${color}40`,
          }}
        />
      </div>
      <span className="text-[10px] font-mono font-bold w-7 text-right" style={{ color }}>
        {score.toFixed(1)}
      </span>
    </div>
  );
}

export default function VehicleScoreCard({ vehicle, rank }: VehicleScoreCardProps) {
  const overallPct = (vehicle.overall_score / 10) * 100;

  return (
    <Link
      to={`/vehicles/${vehicle.id}`}
      className="glass-card glass-card-hover p-5 block no-underline transition-all duration-300 group"
    >
      <div className="flex items-start gap-4">
        {/* Rank badge */}
        <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-[family-name:var(--font-display)] font-bold text-sm ${
          rank === 1 ? 'bg-neon-amber/15 text-neon-amber shadow-[0_0_12px_var(--color-neon-amber-glow)]' :
          rank === 2 ? 'bg-noir-card text-noir-text' :
          rank === 3 ? 'bg-noir-card text-noir-text-secondary' :
          'bg-noir-surface text-noir-muted'
        }`}>
          #{rank}
        </div>

        <div className="flex-1 min-w-0">
          {/* Vehicle name */}
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="text-base font-semibold text-noir-text group-hover:text-neon-cyan transition-colors truncate">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h3>
            {vehicle.trim && (
              <span className="text-xs text-noir-muted shrink-0">{vehicle.trim}</span>
            )}
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {vehicle.mpg_combined && (
              <span className="text-xs font-mono text-neon-cyan">{vehicle.mpg_combined} MPG</span>
            )}
            {vehicle.nhtsa_overall_safety_rating && (
              <span className="text-xs text-neon-green">
                {'★'.repeat(vehicle.nhtsa_overall_safety_rating)}
                <span className="text-noir-border">{'★'.repeat(5 - vehicle.nhtsa_overall_safety_rating)}</span>
              </span>
            )}
            {vehicle.body_style && (
              <span className="text-xs text-noir-muted">{vehicle.body_style.replace(/_/g, ' ')}</span>
            )}
            {vehicle.msrp_original && (
              <span className="text-xs text-noir-muted">{formatCurrency(vehicle.msrp_original)}</span>
            )}
            {vehicle.fuel_type === 'electric' && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/15 text-neon-green font-medium">EV</span>
            )}
          </div>

          {/* Score bars */}
          <div className="space-y-1.5">
            <ScoreBar label="Overall" score={vehicle.overall_score} color="#00f0ff" />
            <ScoreBar label="Cost" score={vehicle.cost_score} color="#39ff14" />
            <ScoreBar label="Reliability" score={vehicle.reliability_score} color="#ffaa00" />
            <ScoreBar label="Comfort" score={vehicle.comfort_score} color="#bf00ff" />
            <ScoreBar label="Cargo" score={vehicle.cargo_score} color="#ff00aa" />
          </div>
        </div>

        {/* Overall score circle */}
        <div className="shrink-0 relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#2a2a3e" strokeWidth="4" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke="#00f0ff"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${overallPct * 1.76} 176`}
              style={{ filter: 'drop-shadow(0 0 4px #00f0ff40)' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold font-mono text-neon-cyan leading-none">
              {vehicle.overall_score.toFixed(1)}
            </span>
            <span className="text-[8px] text-noir-muted uppercase">/10</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
