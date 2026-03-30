import { useState, useEffect } from 'react';
import GigCategoryTabs from '../components/rankings/GigCategoryTabs';
import VehicleScoreCard from '../components/rankings/VehicleScoreCard';
import type { GigCategory, RankedVehicle } from '../api/rankings';

// Mock data for offline dev — replaced by API when backend is running
const MOCK_RANKINGS: Record<GigCategory, RankedVehicle[]> = {
  rideshare: [
    { id: 9, year: 2024, make: 'Toyota', model: 'Camry Hybrid', trim: 'LE', fuel_type: 'gas', mpg_combined: 52, body_style: 'sedan', msrp_original: 30450, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 15.1, overall_score: 8.65, cost_score: 6.3, comfort_score: 7.5, cargo_score: 5.5, reliability_score: 9.5, gig_category: 'rideshare' },
    { id: 6, year: 2022, make: 'Toyota', model: 'Prius', trim: 'LE', fuel_type: 'gas', mpg_combined: 49, body_style: 'compact', msrp_original: 25275, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 20.3, overall_score: 8.42, cost_score: 7.7, comfort_score: 6.0, cargo_score: 4.0, reliability_score: 9.8, gig_category: 'rideshare' },
    { id: 2, year: 2023, make: 'Honda', model: 'Civic', trim: 'LX', fuel_type: 'gas', mpg_combined: 34, body_style: 'sedan', msrp_original: 24950, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 14.8, overall_score: 7.85, cost_score: 7.8, comfort_score: 7.5, cargo_score: 5.0, reliability_score: 9.2, gig_category: 'rideshare' },
    { id: 8, year: 2023, make: 'Honda', model: 'Accord', trim: 'LX', fuel_type: 'gas', mpg_combined: 32, body_style: 'sedan', msrp_original: 28990, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 16.7, overall_score: 7.62, cost_score: 6.5, comfort_score: 8.0, cargo_score: 6.0, reliability_score: 9.3, gig_category: 'rideshare' },
    { id: 3, year: 2023, make: 'Toyota', model: 'Corolla', trim: 'LE', fuel_type: 'gas', mpg_combined: 34, body_style: 'sedan', msrp_original: 22995, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 13.1, overall_score: 7.55, cost_score: 8.2, comfort_score: 6.5, cargo_score: 4.5, reliability_score: 9.5, gig_category: 'rideshare' },
    { id: 4, year: 2023, make: 'Hyundai', model: 'Elantra', trim: 'SE', fuel_type: 'gas', mpg_combined: 35, body_style: 'sedan', msrp_original: 22865, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 14.2, overall_score: 7.31, cost_score: 8.3, comfort_score: 7.0, cargo_score: 5.0, reliability_score: 6.8, gig_category: 'rideshare' },
    { id: 5, year: 2023, make: 'Tesla', model: 'Model 3', trim: 'Standard', fuel_type: 'electric', mpg_combined: 132, body_style: 'sedan', msrp_original: 42990, nhtsa_overall_safety_rating: 5, passenger_capacity: 5, cargo_volume_cuft: 23, overall_score: 7.15, cost_score: 3.8, comfort_score: 8.0, cargo_score: 5.5, reliability_score: 4.5, gig_category: 'rideshare' },
  ],
  food_delivery: [],
  grocery: [],
  package: [],
};
// Copy rideshare as base and adjust scores for other categories
MOCK_RANKINGS.food_delivery = MOCK_RANKINGS.rideshare.map((v) => ({ ...v, gig_category: 'food_delivery', overall_score: v.overall_score - 0.2 + Math.random() * 0.4 }));
MOCK_RANKINGS.grocery = MOCK_RANKINGS.rideshare.map((v) => ({ ...v, gig_category: 'grocery', overall_score: v.overall_score - 0.3 + Math.random() * 0.6 }));
MOCK_RANKINGS.package = MOCK_RANKINGS.rideshare.map((v) => ({ ...v, gig_category: 'package', overall_score: v.overall_score - 0.4 + Math.random() * 0.8 }));

const CATEGORY_LABELS: Record<GigCategory, { title: string; subtitle: string }> = {
  rideshare: { title: 'Best Cars for Rideshare', subtitle: 'Optimized for passenger comfort, fuel efficiency, and reliability' },
  food_delivery: { title: 'Best Cars for Food Delivery', subtitle: 'Optimized for fuel efficiency, low cost, and reliability' },
  grocery: { title: 'Best Cars for Grocery Delivery', subtitle: 'Optimized for cargo space, fuel efficiency, and low cost' },
  package: { title: 'Best Cars for Package Delivery', subtitle: 'Optimized for cargo space, reliability, and fuel efficiency' },
};

export default function RankingsPage() {
  const [category, setCategory] = useState<GigCategory>('rideshare');
  const [vehicles, setVehicles] = useState<RankedVehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // Try API first, fall back to mock data
    fetch(`/api/v1/rankings/${category}?limit=20`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (data?.results?.length) {
          setVehicles(data.results);
        } else {
          setVehicles(
            [...(MOCK_RANKINGS[category] || [])]
              .sort((a, b) => b.overall_score - a.overall_score)
          );
        }
      })
      .catch(() => {
        setVehicles(
          [...(MOCK_RANKINGS[category] || [])]
            .sort((a, b) => b.overall_score - a.overall_score)
        );
      })
      .finally(() => setLoading(false));
  }, [category]);

  const info = CATEGORY_LABELS[category];

  return (
    <div className="relative min-h-screen bg-grid">
      <div className="absolute inset-0 bg-hero-glow pointer-events-none" />

      <div className="relative z-10 px-4 py-8 md:py-12 max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 stagger">
          <p className="animate-fade-in-up text-xs font-medium uppercase tracking-[0.3em] text-neon-amber/60 mb-3 font-[family-name:var(--font-display)]">
            Vehicle Rankings
          </p>
          <h1 className="animate-fade-in-up text-3xl md:text-4xl font-bold font-[family-name:var(--font-display)] text-noir-text mb-2">
            {info.title}
          </h1>
          <p className="animate-fade-in-up text-noir-text-secondary text-sm">
            {info.subtitle}
          </p>
        </header>

        {/* Category tabs */}
        <div className="mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <GigCategoryTabs activeCategory={category} onChange={setCategory} />
        </div>

        {/* Results */}
        <div className="space-y-3 stagger">
          {loading ? (
            // Skeleton loaders
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="glass-card p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-noir-border" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 bg-noir-border rounded w-1/3" />
                    <div className="h-2 bg-noir-border rounded w-1/2" />
                    <div className="space-y-1.5">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="h-1.5 bg-noir-border rounded" />
                      ))}
                    </div>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-noir-border" />
                </div>
              </div>
            ))
          ) : vehicles.length > 0 ? (
            vehicles.map((v, i) => (
              <div key={v.id} className="animate-fade-in-up">
                <VehicleScoreCard vehicle={v} rank={i + 1} />
              </div>
            ))
          ) : (
            <div className="glass-card p-8 text-center">
              <p className="text-noir-muted">No rankings available yet. Run the seed scripts to populate data.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
