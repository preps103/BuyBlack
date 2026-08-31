export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  platformRole?: string | null;
  role?: string | null;
};

export type SubmissionRelationship =
  | "owner"
  | "team_member"
  | "community_nomination";

export type Business = {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string | null;
  category: string;
  description: string;
  websiteUrl: string | null;
  imageUrl: string | null;
  address: string | null;
  city: string;
  state: string;
  location: string;
  status: "pending" | "verified" | "rejected";
  reviewNote: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ownerUserId?: string;
  ownerName?: string;
  submitterRelationship?: SubmissionRelationship;
  ownershipConfirmed?: boolean;
  verificationUrl?: string | null;
  verificationDetails?: string | null;
};

export type CatalogData = {
  businesses: Business[];
  states: string[];
  categories: string[];
  stats: {
    businesses: number;
    states: number;
    categories: number;
  };
};

export type DashboardData = {
  canAdmin: boolean;
  businesses: Business[];
  stats: {
    pending: number;
    verified: number;
    rejected: number;
  };
};
