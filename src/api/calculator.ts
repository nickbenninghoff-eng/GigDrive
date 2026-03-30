import apiClient from './client';
import type { Vehicle } from '../types/vehicle';
import type { CpmInput, CpmResult, CompareResult } from '../types/calculator';

export async function searchVehicles(params: {
  make?: string;
  model?: string;
  year?: number;
  query?: string;
}): Promise<Vehicle[]> {
  const { data } = await apiClient.get('/calculator/vehicles', { params });
  return data;
}

export async function calculateCpm(input: CpmInput): Promise<CpmResult> {
  const { data } = await apiClient.post('/calculator/cost-per-mile', input);
  return data;
}

export async function compareVehicles(
  vehicleInputs: CpmInput[]
): Promise<CompareResult> {
  const { data } = await apiClient.post('/calculator/compare', { vehicles: vehicleInputs });
  return data;
}
