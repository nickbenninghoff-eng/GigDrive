export interface Vehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  fuel_type: string;
  mpg_city: number | null;
  mpg_highway: number | null;
  mpg_combined: number | null;
  kwh_per_100mi: number | null;
  body_style: string | null;
  cargo_volume_cuft: number | null;
  passenger_capacity: number | null;
  msrp_original: number | null;
  nhtsa_overall_safety_rating: number | null;
  nhtsa_complaint_count: number | null;
}

export interface GigVehicleScore {
  id: number;
  vehicle_id: number;
  gig_category: 'rideshare' | 'food_delivery' | 'grocery' | 'package';
  overall_score: number;
  cost_score: number;
  comfort_score: number;
  cargo_score: number;
  reliability_score: number;
}

export interface VehicleSearchResult extends Vehicle {
  gig_scores?: GigVehicleScore[];
}
