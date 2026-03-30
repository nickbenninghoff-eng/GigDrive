import type { CpmInput, CpmBreakdown, CpmResult } from '../types/calculator';

// Average maintenance cost per mile by vehicle age/mileage
const MAINTENANCE_CPM_BASE = 0.09; // $0.09/mile average

// Standard depreciation: ~15% year 1, ~10% years 2-5
function estimateAnnualDepreciation(
  purchasePrice: number,
  method: 'standard' | 'custom',
  customRate?: number
): number {
  if (method === 'custom' && customRate !== undefined) {
    return purchasePrice * (customRate / 100);
  }
  // Average ~12% per year over 5 years for gig vehicles
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

export function calculateCpm(input: CpmInput): CpmResult {
  const annualMiles = input.annualMiles || 30000;
  const mpg = input.mpgCombined || 30;
  const fuelPricePerGallon = (input.fuelPriceCentsPerGallon || 350) / 100;

  // Fuel cost per mile
  const fuelCpm = fuelPricePerGallon / mpg;

  // Maintenance cost per mile
  const maintenanceCpm = MAINTENANCE_CPM_BASE;

  // Insurance cost per mile
  const annualInsurance = ((input.monthlyInsuranceCents || 15000) / 100) * 12;
  const insuranceCpm = annualInsurance / annualMiles;

  // Depreciation cost per mile
  const annualDepreciation = estimateAnnualDepreciation(
    input.purchasePrice || 25000,
    input.depreciationMethod,
    input.annualDepreciationPercent
  );
  const depreciationCpm = annualDepreciation / annualMiles;

  // Financing cost per mile
  const loanAmount = (input.purchasePrice || 25000) - (input.downPayment || 0);
  const monthlyPayment = calculateMonthlyPayment(
    loanAmount,
    input.loanAprPercent || 0,
    input.loanTermMonths || 60
  );
  const annualInterest =
    monthlyPayment * (input.loanTermMonths || 60) - loanAmount;
  const annualInterestCost =
    (input.loanTermMonths || 60) > 0
      ? annualInterest / ((input.loanTermMonths || 60) / 12)
      : 0;
  const financingCpm = annualInterestCost / annualMiles;

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

function round(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}
