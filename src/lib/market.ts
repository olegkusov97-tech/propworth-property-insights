// Simulated UAE market data for the PropWorth prototype. All figures are illustrative.
export type PropertyType = "Apartment" | "Villa" | "Townhouse";

export interface Community {
  id: string;
  name: string;
  city: string;
  type: PropertyType;
  avgPricePerSqft: number;
  searches: number; // monthly aggregated buyer searches
  saves: number;
  enquiries: number;
  activeListings: number;
  transactions90d: number;
  avgDaysOnMarket: number;
  rentalYield: number;
}

export const communities: Community[] = [
  { id: "jvc", name: "Jumeirah Village Circle", city: "Dubai", type: "Apartment", avgPricePerSqft: 1250, searches: 48200, saves: 6100, enquiries: 2300, activeListings: 3100, transactions90d: 1650, avgDaysOnMarket: 52, rentalYield: 7.4 },
  { id: "marina", name: "Dubai Marina", city: "Dubai", type: "Apartment", avgPricePerSqft: 2100, searches: 61000, saves: 8400, enquiries: 2900, activeListings: 2600, transactions90d: 1400, avgDaysOnMarket: 41, rentalYield: 6.2 },
  { id: "dhills", name: "Dubai Hills Estate", city: "Dubai", type: "Villa", avgPricePerSqft: 2350, searches: 39000, saves: 7200, enquiries: 1800, activeListings: 640, transactions90d: 520, avgDaysOnMarket: 34, rentalYield: 5.1 },
  { id: "springs", name: "The Springs", city: "Dubai", type: "Townhouse", avgPricePerSqft: 1750, searches: 22000, saves: 3900, enquiries: 1100, activeListings: 280, transactions90d: 240, avgDaysOnMarket: 29, rentalYield: 5.6 },
  { id: "dsc", name: "Dubai Sports City", city: "Dubai", type: "Apartment", avgPricePerSqft: 950, searches: 15500, saves: 1500, enquiries: 600, activeListings: 1900, transactions90d: 480, avgDaysOnMarket: 88, rentalYield: 7.9 },
  { id: "reem", name: "Al Reem Island", city: "Abu Dhabi", type: "Apartment", avgPricePerSqft: 1300, searches: 26000, saves: 2900, enquiries: 1000, activeListings: 1700, transactions90d: 700, avgDaysOnMarket: 63, rentalYield: 6.8 },
  { id: "yas", name: "Yas Island", city: "Abu Dhabi", type: "Townhouse", avgPricePerSqft: 1450, searches: 18500, saves: 2600, enquiries: 780, activeListings: 520, transactions90d: 310, avgDaysOnMarket: 48, rentalYield: 6.0 },
  { id: "aljada", name: "Aljada", city: "Sharjah", type: "Apartment", avgPricePerSqft: 900, searches: 12500, saves: 1400, enquiries: 520, activeListings: 900, transactions90d: 360, avgDaysOnMarket: 58, rentalYield: 7.1 },
];

const clamp = (n: number, a = 0, b = 100) => Math.max(a, Math.min(b, n));

/** Demand index 0-100 from searches, saves and enquiries relative to supply. */
export function demandIndex(c: Community) {
  const weighted = c.searches * 0.2 + c.saves * 1 + c.enquiries * 3;
  return Math.round(clamp((weighted / c.activeListings) * 4.5));
}
/** Competition index 0-100: higher = more competing listings vs. absorption. */
export function competitionIndex(c: Community) {
  const monthsOfSupply = c.activeListings / (c.transactions90d / 3);
  return Math.round(clamp(monthsOfSupply * 14));
}
/** Liquidity score 0-100 combining demand, competition and speed of sale. */
export function liquidityScore(c: Community) {
  const speed = clamp(100 - c.avgDaysOnMarket);
  return Math.round(clamp(demandIndex(c) * 0.45 + (100 - competitionIndex(c)) * 0.3 + speed * 0.25));
}
/** UNVALIDATED indicative probability of sale within 90 days at a given asking premium (%). */
export function sale90Probability(c: Community, askingPremiumPct = 0) {
  const base = 25 + liquidityScore(c) * 0.6;
  return Math.round(clamp(base - askingPremiumPct * 4, 3, 95));
}
export function liquidityLabel(score: number) {
  if (score >= 70) return "High";
  if (score >= 50) return "Moderate";
  return "Low";
}

/** Deterministic 12-month history for a metric. */
export function history(seed: string, end: number, drift = 0.03, noise = 0.04) {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) % 9973;
  const out: number[] = [];
  for (let i = 11; i >= 0; i--) {
    h = (h * 7919 + 13) % 9973;
    const n = (h / 9973 - 0.5) * noise;
    out.push(end * (1 - drift * (i / 11)) * (1 + (i === 0 ? 0 : n)));
  }
  return out;
}

export const months = ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"];

export const aed = (n: number) =>
  n >= 1_000_000 ? `AED ${(n / 1_000_000).toFixed(2)}M` : `AED ${Math.round(n / 1000)}K`;

export const getCommunity = (id: string) => communities.find((c) => c.id === id) ?? communities[0]!;

/** UAE mortgage affordability (simplified): 25% min deposit for expats < AED 5M, ~7% fees, DBR 50%. */
export function affordability(income: number, savings: number, debts: number, rate = 4.5, years = 25) {
  const r = rate / 100 / 12, n = years * 12;
  const maxPayment = Math.max(0, income * 0.5 - debts);
  const maxLoan = (maxPayment * (1 - Math.pow(1 + r, -n))) / r;
  const byDeposit = savings / (0.25 + 0.07);
  const byLoan = maxLoan / 0.75;
  const budget = Math.max(0, Math.min(byDeposit, byLoan));
  const monthly = ((budget * 0.75) * r) / (1 - Math.pow(1 + r, -n));
  const readiness = Math.round(clamp((byDeposit / Math.max(byLoan, 1)) * 60 + (maxPayment > 0 ? 25 : 0) + (debts < income * 0.15 ? 15 : 0)));
  return { budget, deposit: budget * 0.25, fees: budget * 0.07, monthly, limitedBy: byDeposit < byLoan ? "savings" : "income", readiness };
}
