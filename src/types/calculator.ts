export interface CpmInput {
  vehicleId?: number;
  mpgCombined?: number;
  fuelType?: string;
  annualMiles: number;
  fuelPriceCentsPerGallon: number;
  monthlyInsuranceCents: number;
  purchasePrice: number;
  downPayment: number;
  loanTermMonths: number;
  loanAprPercent: number;
  depreciationMethod: 'standard' | 'custom';
  annualDepreciationPercent?: number;
}

export interface CpmBreakdown {
  fuel: number;
  maintenance: number;
  insurance: number;
  depreciation: number;
  financing: number;
  total: number;
}

export interface CpmResult {
  costPerMile: CpmBreakdown;
  daily: CpmBreakdown;
  weekly: CpmBreakdown;
  monthly: CpmBreakdown;
  yearly: CpmBreakdown;
  vehicle?: {
    year: number;
    make: string;
    model: string;
    mpgCombined: number;
  };
}

export interface CompareResult {
  vehicles: Array<{
    vehicle: {
      id: number;
      year: number;
      make: string;
      model: string;
    };
    cpm: CpmResult;
  }>;
}
