export type AuthUser = {
  id: string;
  email: string;
  displayName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  platformRole?: string | null;
  role?: string | null;
};

export type Business = {
  id: string;
  ownerUserId: string;
  name: string;
  slug: string;
  ownerName: string;
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
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type Product = {
  id: string;
  businessId: string;
  name: string;
  description: string;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
  inventoryCount: number | null;
  status: "active" | "draft" | "archived";
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  id: string;
  businessId: string;
  businessName: string | null;
  userId: string;
  userName: string;
  rating: number;
  body: string;
  helpfulCount: number;
  createdAt: string;
};

export type Order = {
  id: string;
  businessId: string;
  businessName: string | null;
  customerEmail: string | null;
  provider: "stripe" | "paypal";
  providerOrderId: string | null;
  status: "pending" | "paid" | "cancelled" | "failed";
  currency: string;
  subtotalCents: number;
  totalCents: number;
  items: Array<{
    productId: string;
    quantity: number;
    name: string;
    unitAmountCents: number;
    businessId: string;
  }>;
  checkoutUrl: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ProviderReadiness = {
  provider: "stripe" | "paypal";
  label: string;
  configured: boolean;
  webhooksConfigured: boolean;
  mode: string;
};

export type PaymentsReadiness = {
  stripe: ProviderReadiness;
  paypal: ProviderReadiness;
};

export type CatalogData = {
  businesses: Business[];
  products: Product[];
  reviews: Review[];
  states: string[];
  categories: string[];
  stats: {
    businesses: number;
    states: number;
    products: number;
    reviews: number;
  };
  payments: PaymentsReadiness;
};

export type DashboardData = {
  canAdmin: boolean;
  businesses: Business[];
  products: Product[];
  orders: Order[];
  payments: PaymentsReadiness;
};

export type CartItem = {
  product: Product;
  business: Business;
  quantity: number;
};
