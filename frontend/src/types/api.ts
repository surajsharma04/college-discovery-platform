export type CollegeCard = {
  id: string;
  name: string;
  location: string;
  city: string;
  state: string;
  annualFees: number;
  rating: number;
  placementRate: number;
  type: string;
  slug: string;
};

export type CollegeDetail = CollegeCard & {
  description: string;
  website: string | null;
  establishedIn: number;
  courses: Array<{
    id: string;
    name: string;
    duration: string;
    seats: number;
    totalFee: number;
    averageCtc: number;
  }>;
  cutoffs: Array<{
    id: string;
    exam: string;
    maxRank: number;
    scoreBand: string;
  }>;
  placements: Array<{
    id: string;
    year: number;
    placementRate: number;
    medianCtc: number;
    highestCtc: number;
    topRecruiters: string[];
  }>;
  reviews: Array<{
    id: string;
    authorName: string;
    headline: string;
    body: string;
    rating: number;
    sourceType: string;
    createdAt: string;
  }>;
};

export type DiscussionQuestion = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
  answers: Array<{
    id: string;
    body: string;
    createdAt: string;
    updatedAt?: string;
    user: {
      id: string;
      name: string;
    };
  }>;
};

export type PredictorResult = {
  exam: string;
  rank: number;
  colleges: Array<{
    id: string;
    name: string;
    location: string;
    annualFees: number;
    rating: number;
    placementRate: number;
    qualifyingRank: number;
    matchedExam: string;
    cutoffBand: string;
    confidence: "safe" | "target" | "ambitious";
    explanation: string;
  }>;
};

export type AuthUser = {
  id: string;
  email: string;
  name: string;
};
