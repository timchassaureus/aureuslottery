export type TalentCategory =
  | "student"
  | "reconversion"
  | "athlete"
  | "creator"
  | "entrepreneur"
  | "freelancer"
  | "artist"
  | "healthcare";

export interface Talent {
  id: string;
  fullName: string;
  headline: string;
  category: TalentCategory;
  country: string;
  city?: string;
  videoUrl?: string;
  amountRequested: number; // en euros
  incomeSharePercent: number; // % des revenus futurs
  durationYears: number;
  description: string;
}

