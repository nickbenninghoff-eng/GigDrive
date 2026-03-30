import apiClient from './client';

export type GigCategory = 'rideshare' | 'food_delivery' | 'grocery' | 'package';

export interface RankedVehicle {
  id: number;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  fuel_type: string;
  mpg_combined: number | null;
  body_style: string | null;
  msrp_original: number | null;
  nhtsa_overall_safety_rating: number | null;
  passenger_capacity: number | null;
  cargo_volume_cuft: number | null;
  overall_score: number;
  cost_score: number;
  comfort_score: number;
  cargo_score: number;
  reliability_score: number;
  gig_category: string;
}

export interface RankingsResponse {
  category: string;
  results: RankedVehicle[];
  pagination: { total: number; limit: number; offset: number };
}

export async function fetchRankings(
  category: GigCategory,
  params?: { limit?: number; offset?: number; year_min?: number; body_style?: string; fuel_type?: string }
): Promise<RankingsResponse> {
  const { data } = await apiClient.get(`/rankings/${category}`, { params });
  return data;
}

export async function fetchVehicleDetail(id: number) {
  const { data } = await apiClient.get(`/vehicles/${id}`);
  return data;
}
