import { useState, useEffect } from 'react';

interface GasStation {
  id: number;
  station_name: string;
  brand: string | null;
  address: string | null;
  regular_cents: number | null;
  midgrade_cents: number | null;
  premium_cents: number | null;
  diesel_cents: number | null;
  reported_at: string;
}

interface NationalAverage {
  regular: number;
  midgrade: number;
  premium: number;
  diesel: number;
  source: string;
}

const MOCK_STATIONS: GasStation[] = [
  { id: 1, station_name: 'Costco Gas', brand: 'Costco', address: '123 Main St', regular_cents: 319, midgrade_cents: null, premium_cents: 359, diesel_cents: 339, reported_at: '2026-03-29T10:00:00Z' },
  { id: 2, station_name: 'Shell', brand: 'Shell', address: '456 Oak Ave', regular_cents: 345, midgrade_cents: 365, premium_cents: 389, diesel_cents: 359, reported_at: '2026-03-29T08:30:00Z' },
  { id: 3, station_name: 'Speedway', brand: 'Speedway', address: '789 Elm Dr', regular_cents: 335, midgrade_cents: 355, premium_cents: 379, diesel_cents: 349, reported_at: '2026-03-28T22:00:00Z' },
  { id: 4, station_name: 'BP', brand: 'BP', address: '321 Pine Rd', regular_cents: 349, midgrade_cents: 369, premium_cents: 399, diesel_cents: 365, reported_at: '2026-03-28T18:00:00Z' },
  { id: 5, station_name: 'QuikTrip', brand: 'QT', address: '654 Maple Ln', regular_cents: 329, midgrade_cents: 349, premium_cents: 369, diesel_cents: 345, reported_at: '2026-03-28T15:00:00Z' },
];

function PriceTag({ cents, label, isCheapest }: { cents: number | null; label: string; isCheapest?: boolean }) {
  if (!cents) return <span className="text-xs text-noir-muted">—</span>;
  return (
    <div className="text-center">
      <p className="text-[10px] text-noir-muted uppercase">{label}</p>
      <p className={`text-sm font-mono font-bold ${isCheapest ? 'text-neon-green' : 'text-noir-text'}`}>
        ${(cents / 100).toFixed(2)}
      </p>
    </div>
  );
}

export default function GasPricesPage() {
  const [zipCode, setZipCode] = useState('');
  const [stations, setStations] = useState<GasStation[]>(MOCK_STATIONS);
  const [averages, setAverages] = useState<NationalAverage | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch national averages
    fetch('/api/v1/gas/average')
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data) setAverages(data);
        else setAverages({ regular: 3.50, midgrade: 3.89, premium: 4.19, diesel: 3.79, source: 'estimated' });
      })
      .catch(() => setAverages({ regular: 3.50, midgrade: 3.89, premium: 4.19, diesel: 3.79, source: 'estimated' }));
  }, []);

  function handleSearch() {
    if (!zipCode) return;
    setLoading(true);
    fetch(`/api/v1/gas/nearby?zip=${zipCode}`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        if (data?.length) setStations(data);
        else setStations(MOCK_STATIONS); // Fallback to mock
      })
      .catch(() => setStations(MOCK_STATIONS))
      .finally(() => setLoading(false));
  }

  const cheapestRegular = Math.min(...stations.filter((s) => s.regular_cents).map((s) => s.regular_cents!));

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        <header className="mb-8 stagger">
          <p className="animate-fade-in-up text-xs font-medium uppercase tracking-[0.3em] text-neon-green/60 mb-3 font-[family-name:var(--font-display)]">
            Fuel Prices
          </p>
          <h1 className="animate-fade-in-up text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text">
            Find Cheap Gas
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-sm mt-2">
            Community-reported gas prices near you. Every cent counts.
          </p>
        </header>

        {/* National averages */}
        {averages && (
          <div className="glass-card p-5 mb-6 animate-fade-in-up">
            <h3 className="text-xs text-noir-muted uppercase tracking-wider mb-3 font-[family-name:var(--font-display)]">
              National Averages
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-xs text-noir-muted">Regular</p>
                <p className="text-lg font-mono font-bold text-neon-green">${averages.regular.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-noir-muted">Mid</p>
                <p className="text-lg font-mono font-bold text-neon-amber">${averages.midgrade.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-noir-muted">Premium</p>
                <p className="text-lg font-mono font-bold text-neon-magenta">${averages.premium.toFixed(2)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-noir-muted">Diesel</p>
                <p className="text-lg font-mono font-bold text-neon-cyan">${averages.diesel.toFixed(2)}</p>
              </div>
            </div>
            <p className="text-[10px] text-noir-muted text-center mt-2">
              Source: {averages.source}
            </p>
          </div>
        )}

        {/* Zip search */}
        <div className="glass-card p-4 mb-6 animate-fade-in-up flex gap-3">
          <input
            type="text"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter zip code..."
            className="neon-input flex-1"
            maxLength={10}
          />
          <button
            onClick={handleSearch}
            disabled={loading || !zipCode}
            className="neon-btn neon-btn-cyan !py-2 !px-6 shrink-0 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        {/* Station list */}
        <div className="space-y-3 stagger">
          {stations.map((station) => (
            <div key={station.id} className="glass-card p-4 animate-fade-in-up">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-noir-text truncate">{station.station_name}</h3>
                    {station.brand && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-noir-card text-noir-muted shrink-0">
                        {station.brand}
                      </span>
                    )}
                  </div>
                  {station.address && (
                    <p className="text-xs text-noir-muted truncate">{station.address}</p>
                  )}
                  <p className="text-[10px] text-noir-muted mt-1">
                    Reported {new Date(station.reported_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-4 shrink-0">
                  <PriceTag cents={station.regular_cents} label="Regular" isCheapest={station.regular_cents === cheapestRegular} />
                  <PriceTag cents={station.premium_cents} label="Premium" />
                  <PriceTag cents={station.diesel_cents} label="Diesel" />
                </div>
              </div>

              {/* Savings hint */}
              {station.regular_cents && station.regular_cents === cheapestRegular && (
                <div className="mt-2 pt-2 border-t border-noir-border/50">
                  <p className="text-xs text-neon-green">
                    Cheapest nearby — save ${((MOCK_STATIONS[MOCK_STATIONS.length - 1].regular_cents! - station.regular_cents) / 100 * 12).toFixed(2)}/week on a 12 gallon fill-up
                  </p>
                </div>
              )}
            </div>
          ))}

          <div className="glass-card p-5 text-center animate-fade-in-up">
            <p className="text-sm text-noir-text-secondary mb-3">Know a gas price? Help fellow drivers.</p>
            <button className="neon-btn neon-btn-cyan text-sm">Report a Price</button>
          </div>
        </div>
      </div>
    </div>
  );
}
