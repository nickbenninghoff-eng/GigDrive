import { create } from 'zustand';
import type { Vehicle } from '../types/vehicle';
import type { CpmInput, CpmResult } from '../types/calculator';

interface CalculatorState {
  selectedVehicle: Vehicle | null;
  input: CpmInput;
  result: CpmResult | null;
  isCalculating: boolean;
  compareVehicles: Array<{ vehicle: Vehicle; result: CpmResult }>;

  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  updateInput: (partial: Partial<CpmInput>) => void;
  setResult: (result: CpmResult | null) => void;
  setIsCalculating: (v: boolean) => void;
  addCompareVehicle: (vehicle: Vehicle, result: CpmResult) => void;
  removeCompareVehicle: (index: number) => void;
  clearCompare: () => void;
}

const defaultInput: CpmInput = {
  annualMiles: 30000,
  fuelPriceCentsPerGallon: 350,
  monthlyInsuranceCents: 15000,
  purchasePrice: 25000,
  downPayment: 5000,
  loanTermMonths: 60,
  loanAprPercent: 6.5,
  depreciationMethod: 'standard',
};

export const useCalculatorStore = create<CalculatorState>((set) => ({
  selectedVehicle: null,
  input: defaultInput,
  result: null,
  isCalculating: false,
  compareVehicles: [],

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  updateInput: (partial) =>
    set((state) => ({ input: { ...state.input, ...partial } })),
  setResult: (result) => set({ result }),
  setIsCalculating: (v) => set({ isCalculating: v }),
  addCompareVehicle: (vehicle, result) =>
    set((state) => ({
      compareVehicles: [...state.compareVehicles, { vehicle, result }].slice(0, 4),
    })),
  removeCompareVehicle: (index) =>
    set((state) => ({
      compareVehicles: state.compareVehicles.filter((_, i) => i !== index),
    })),
  clearCompare: () => set({ compareVehicles: [] }),
}));
