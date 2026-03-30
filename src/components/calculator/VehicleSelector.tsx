import { useState, useRef, useEffect, useCallback } from 'react';
import type { Vehicle } from '../../types/vehicle';

// Mock data for offline development — will be replaced by API calls
const MOCK_VEHICLES: Vehicle[] = [
  { id: 1, year: 2023, make: 'Toyota', model: 'Camry', trim: 'LE', fuel_type: 'gas', mpg_city: 28, mpg_highway: 39, mpg_combined: 32, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 15.1, passenger_capacity: 5, msrp_original: 28855, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 12 },
  { id: 2, year: 2023, make: 'Honda', model: 'Civic', trim: 'LX', fuel_type: 'gas', mpg_city: 31, mpg_highway: 40, mpg_combined: 34, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 14.8, passenger_capacity: 5, msrp_original: 24950, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 8 },
  { id: 3, year: 2023, make: 'Toyota', model: 'Corolla', trim: 'LE', fuel_type: 'gas', mpg_city: 31, mpg_highway: 40, mpg_combined: 34, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 13.1, passenger_capacity: 5, msrp_original: 22995, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 5 },
  { id: 4, year: 2023, make: 'Hyundai', model: 'Elantra', trim: 'SE', fuel_type: 'gas', mpg_city: 31, mpg_highway: 41, mpg_combined: 35, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 14.2, passenger_capacity: 5, msrp_original: 22865, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 15 },
  { id: 5, year: 2023, make: 'Tesla', model: 'Model 3', trim: 'Standard', fuel_type: 'electric', mpg_city: null, mpg_highway: null, mpg_combined: 132, kwh_per_100mi: 25, body_style: 'sedan', cargo_volume_cuft: 23, passenger_capacity: 5, msrp_original: 42990, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 42 },
  { id: 6, year: 2022, make: 'Toyota', model: 'Prius', trim: 'LE', fuel_type: 'gas', mpg_city: 51, mpg_highway: 47, mpg_combined: 49, kwh_per_100mi: null, body_style: 'compact', cargo_volume_cuft: 20.3, passenger_capacity: 5, msrp_original: 25275, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 3 },
  { id: 7, year: 2023, make: 'Kia', model: 'Forte', trim: 'LXS', fuel_type: 'gas', mpg_city: 30, mpg_highway: 39, mpg_combined: 33, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 15.3, passenger_capacity: 5, msrp_original: 20515, nhtsa_overall_safety_rating: 4, nhtsa_complaint_count: 18 },
  { id: 8, year: 2023, make: 'Honda', model: 'Accord', trim: 'LX', fuel_type: 'gas', mpg_city: 29, mpg_highway: 37, mpg_combined: 32, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 16.7, passenger_capacity: 5, msrp_original: 28990, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 7 },
  { id: 9, year: 2024, make: 'Toyota', model: 'Camry', trim: 'LE Hybrid', fuel_type: 'gas', mpg_city: 51, mpg_highway: 53, mpg_combined: 52, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 15.1, passenger_capacity: 5, msrp_original: 30450, nhtsa_overall_safety_rating: 5, nhtsa_complaint_count: 2 },
  { id: 10, year: 2023, make: 'Nissan', model: 'Sentra', trim: 'S', fuel_type: 'gas', mpg_city: 29, mpg_highway: 39, mpg_combined: 33, kwh_per_100mi: null, body_style: 'sedan', cargo_volume_cuft: 14.3, passenger_capacity: 5, msrp_original: 21180, nhtsa_overall_safety_rating: 4, nhtsa_complaint_count: 22 },
];

interface VehicleSelectorProps {
  onSelect: (vehicle: Vehicle) => void;
  selectedVehicle: Vehicle | null;
}

export default function VehicleSelector({ onSelect, selectedVehicle }: VehicleSelectorProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Vehicle[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const search = useCallback((q: string) => {
    if (!q.trim()) {
      setResults(MOCK_VEHICLES.slice(0, 6));
      return;
    }
    const lower = q.toLowerCase();
    const filtered = MOCK_VEHICLES.filter(
      (v) =>
        v.make.toLowerCase().includes(lower) ||
        v.model.toLowerCase().includes(lower) ||
        `${v.year}`.includes(lower) ||
        `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(lower)
    );
    setResults(filtered.slice(0, 8));
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(vehicle: Vehicle) {
    onSelect(vehicle);
    setQuery(`${vehicle.year} ${vehicle.make} ${vehicle.model}`);
    setIsOpen(false);
    setHighlightIndex(-1);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIndex >= 0) {
      e.preventDefault();
      handleSelect(results[highlightIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-xs font-medium text-noir-text-secondary mb-2 uppercase tracking-wider font-[family-name:var(--font-display)]">
        Select Your Vehicle
      </label>

      <div className="relative">
        {/* Search icon */}
        <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-noir-muted pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search make, model, or year..."
          className="neon-input !pl-12 !pr-4 text-base"
          autoComplete="off"
        />

        {selectedVehicle && !isOpen && (
          <button
            onClick={() => {
              setQuery('');
              onSelect(null as unknown as Vehicle);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-noir-border flex items-center justify-center text-noir-muted hover:text-neon-cyan hover:bg-noir-card transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 glass-card overflow-hidden animate-fade-in"
          style={{ animationDuration: '0.15s' }}
        >
          <div className="py-1 max-h-72 overflow-y-auto">
            {results.map((vehicle, index) => (
              <button
                key={vehicle.id}
                onClick={() => handleSelect(vehicle)}
                className={`w-full text-left px-4 py-3 flex items-center gap-4 transition-all duration-150 ${
                  index === highlightIndex
                    ? 'bg-neon-cyan/10 border-l-2 border-neon-cyan'
                    : 'hover:bg-white/5 border-l-2 border-transparent'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-noir-text">
                      {vehicle.year} {vehicle.make} {vehicle.model}
                    </span>
                    {vehicle.trim && (
                      <span className="text-xs text-noir-muted">{vehicle.trim}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-xs text-neon-cyan font-mono font-medium">
                      {vehicle.mpg_combined} MPG
                    </span>
                    <span className="text-xs text-noir-muted">
                      {vehicle.body_style}
                    </span>
                    {vehicle.fuel_type === 'electric' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/15 text-neon-green font-medium">
                        EV
                      </span>
                    )}
                  </div>
                </div>

                {/* MPG badge */}
                <div className={`text-right px-2.5 py-1 rounded-lg text-xs font-mono font-bold ${
                  (vehicle.mpg_combined ?? 0) >= 40
                    ? 'bg-neon-green/10 text-neon-green'
                    : (vehicle.mpg_combined ?? 0) >= 30
                    ? 'bg-neon-cyan/10 text-neon-cyan'
                    : 'bg-neon-amber/10 text-neon-amber'
                }`}>
                  {vehicle.mpg_combined}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && query && results.length === 0 && (
        <div className="absolute z-50 w-full mt-2 glass-card p-4 text-center text-sm text-noir-muted animate-fade-in">
          No vehicles found for "{query}"
        </div>
      )}
    </div>
  );
}
