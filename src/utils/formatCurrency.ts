export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCpm(cpm: number): string {
  return `$${cpm.toFixed(4)}`;
}

export function formatCpmShort(cpm: number): string {
  return `${(cpm * 100).toFixed(1)}¢`;
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}
