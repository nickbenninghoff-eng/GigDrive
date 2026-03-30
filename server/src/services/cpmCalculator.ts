import { z } from 'zod';

export const cpmInputSchema = z.object({
  vehicleId: z.number().optional(),
  mpgCombined: z.number().optional(),
  fuelType: z.string().optional(),
  annualMiles: z.number().min(1).max(200000).default(30000),
  fuelPriceCentsPerGallon: z.number().min(1).max(10000).default(350),
  monthlyInsuranceCents: z.number().min(0).max(500000).default(15000),
  purchasePrice: z.number().min(0).max(500000).default(25000),
  downPayment: z.number().min(0).default(5000),
  loanTermMonths: z.number().min(0).max(120).default(60),
  loanAprPercent: z.number().min(0).max(30).default(6.5),
  depreciationMethod: z.enum(['standard', 'custom']).default('standard'),
  annualDepreciationPercent: z.number().min(0).max(100).optional(),
});

export type CpmInput = z.infer<typeof cpmInputSchema>;

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

const MAINTENANCE_CPM_BASE = 0.09;

function estimateAnnualDepreciation(
  purchasePrice: number,
  method: 'standard' | 'custom',
  customRate?: number
): number {
  if (method === 'custom' && customRate !== undefined) {
    return purchasePrice * (customRate / 100);
  }
  return purchasePrice * 0.12;
}

function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (principal <= 0 || termMonths <= 0) return 0;
  if (annualRate <= 0) return principal / termMonths;
  const monthlyRate = annualRate / 100 / 12;
  return (
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1)
  );
}

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function multiplyBreakdown(cpm: CpmBreakdown, miles: number): CpmBreakdown {
  return {
    fuel: round(cpm.fuel * miles, 2),
    maintenance: round(cpm.maintenance * miles, 2),
    insurance: round(cpm.insurance * miles, 2),
    depreciation: round(cpm.depreciation * miles, 2),
    financing: round(cpm.financing * miles, 2),
    total: round(cpm.total * miles, 2),
  };
}

export function computeCpm(input: CpmInput, mpgOverride?: number): CpmResult {
  const annualMiles = input.annualMiles;
  const mpg = mpgOverride || input.mpgCombined || 30;
  const fuelPricePerGallon = input.fuelPriceCentsPerGallon / 100;

  const fuelCpm = fuelPricePerGallon / mpg;
  const maintenanceCpm = MAINTENANCE_CPM_BASE;

  const annualInsurance = (input.monthlyInsuranceCents / 100) * 12;
  const insuranceCpm = annualInsurance / annualMiles;

  const annualDepreciation = estimateAnnualDepreciation(
    input.purchasePrice,
    input.depreciationMethod,
    input.annualDepreciationPercent
  );
  const depreciationCpm = annualDepreciation / annualMiles;

  const loanAmount = input.purchasePrice - input.downPayment;
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    input.loanAprPercent,
    input.loanTermMonths
  );
  const totalInterest = monthlyPayment * input.loanTermMonths - loanAmount;
  const loanYears = input.loanTermMonths / 12;
  const annualInterest = loanYears > 0 ? totalInterest / loanYears : 0;
  const financingCpm = annualInterest / annualMiles;

  const totalCpm =
    fuelCpm + maintenanceCpm + insuranceCpm + depreciationCpm + financingCpm;

  const breakdown: CpmBreakdown = {
    fuel: round(fuelCpm, 4),
    maintenance: round(maintenanceCpm, 4),
    insurance: round(insuranceCpm, 4),
    depreciation: round(depreciationCpm, 4),
    financing: round(financingCpm, 4),
    total: round(totalCpm, 4),
  };

  const dailyMiles = annualMiles / 365;
  const weeklyMiles = annualMiles / 52;
  const monthlyMiles = annualMiles / 12;

  return {
    costPerMile: breakdown,
    daily: multiplyBreakdown(breakdown, dailyMiles),
    weekly: multiplyBreakdown(breakdown, weeklyMiles),
    monthly: multiplyBreakdown(breakdown, monthlyMiles),
    yearly: multiplyBreakdown(breakdown, annualMiles),
  };
}
