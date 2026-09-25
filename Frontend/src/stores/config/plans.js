export const DEFAULT_PLAN_ID = "free";

export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    priceLabel: "R0",
    description:
      "Essential features for casual listeners and beginning artists.",
    limits: { songs: 5, beats: 3 },
    boosts: "None",
    analytics: "Basic play count",
    profile: "Standard",
    commission: 0.15, // 15% decimal for math
    commissionText: "15%",
    listenerPerks: "Ad-supported, 5 playlists",
    pillClass: "free-pill",
    featured: false,
  },
  plus: {
    id: "plus",
    name: "Plus",
    price: 49,
    priceLabel: "R49",
    description:
      "Supercharge your growth with increased uploads, insights, and a verified badge.",
    limits: { songs: 25, beats: 15 },
    boosts: "1 boost/mo",
    analytics: "30-day insights",
    profile: "Verified-style badge",
    commission: 0.1, // 10% decimal for math
    commissionText: "10%",
    listenerPerks: "Ad-free, unlimited playlists",
    pillClass: "plus-pill",
    featured: true,
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 129,
    priceLabel: "R129",
    description:
      "Maximum exposure, lowest commissions, and full demographic power for pros.",
    limits: { songs: Infinity, beats: Infinity }, // Unlimited
    boosts: "5 boosts/mo",
    analytics: "Full insights & demographics",
    profile: "Badge & Discover feature",
    commission: 0.05, // 5% decimal for math
    commissionText: "5%",
    listenerPerks: "Ad-free, unlimited & presale",
    pillClass: "pro-pill",
    featured: false,
  },
};

export const FEATURE_ROWS = [
  {
    key: "songs",
    label: "Song uploads",
    format: (p) => formatLimit(p.limits.songs),
  },
  {
    key: "beats",
    label: "Beat uploads",
    format: (p) => formatLimit(p.limits.beats),
  },
  {
    key: "commission",
    label: "Beat commission",
    format: (p) => p.commissionText,
  },
  { key: "boosts", label: "Monthly boosts", format: (p) => p.boosts },
  { key: "analytics", label: "Analytics", format: (p) => p.analytics },
  { key: "profile", label: "Profile badge", format: (p) => p.profile },
];

export function getPlan(planId) {
  return PLANS[planId] || PLANS[DEFAULT_PLAN_ID];
}

export function getPlanRank(planId) {
  const ranks = { free: 1, plus: 2, pro: 3 };
  return ranks[planId] || 1;
}

export function formatLimit(limit) {
  return limit === Infinity ? "Unlimited" : limit;
}

export function formatPrice(plan) {
  return plan.priceLabel;
}

export function calcBeatPayout(salePrice, plan) {
  const commissionAmount = salePrice * plan.commission;
  const payout = salePrice - commissionAmount;
  return { commissionAmount, payout };
}
