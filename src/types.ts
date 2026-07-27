/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  description: string;
  image: string;
  rating: number;
  reviewsCount: number;
}

export interface Store {
  id: string;
  name: string;
  category: string;
  ownerName: string;
  ownerBio: string;
  story: string;
  coverImage: string;
  ownerImage: string;
  rating: number;
  products: Product[];
  reviews: Review[];
}

export interface CartItem {
  product: Product;
  storeId: string;
  storeName: string;
  quantity: number;
}

export interface ShippingDetails {
  fullName: string;
  email: string;
  addressLine1: string;
  city: string;
  state: string;
  zipCode: string;
  paymentMethod: 'card' | 'cashapp' | 'cultural_gold';
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  shippingDetails: ShippingDetails;
  status: 'Processing' | 'Shipped' | 'Delivered';
}

