export const REGIONS = [
  { value: "kz", label: "Kazakhstan" },
  { value: "kg", label: "Kyrgyzstan" },
] as const;

export type RegionValue = (typeof REGIONS)[number]["value"];
