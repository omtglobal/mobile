/**
 * Domain models matching 02-api-contracts and web client types
 */

import type { PaginatedMeta } from './api';

// Product badges (storefront)
export const PRODUCT_BADGES = ['choice', 'saving', 'brand_plus', 'best_sale'] as const;
export type ProductBadge = (typeof PRODUCT_BADGES)[number];

export interface ProductImage {
  id: string;
  media_id?: string;
  url: string;
  thumbnail_url: string | null;
  filename?: string;
  mime_type?: string;
  size?: number;
  is_primary: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  parent_id: string | null;
  path: string;
  children?: Category[];
  products_count?: number;
}

export interface CompanyShort {
  id: string;
  name: string;
  is_premium_plus?: boolean;
  /** Seller user id for starting a direct messenger chat from product. */
  owner_user_id?: string | null;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  short_description?: string | null;
  sku: string;
  price: number | string;
  currency: string;
  status: string;
  status_label: string;
  stock_quantity: number;
  attributes: Record<string, unknown>;
  badges?: ProductBadge[];
  category: Category | null;
  company: CompanyShort | null;
  images: ProductImage[];
  primary_image: ProductImage | null;
  rating_avg: number | null;
  review_count: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProductFilters {
  page?: number;
  per_page?: number;
  sort_by?: 'published_at' | 'price' | 'title' | 'created_at' | 'reviews_count';
  sort_order?: 'asc' | 'desc';
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  q?: string;
  category_id?: string;
}

// Reviews
export interface Review {
  id: string;
  product_id: string;
  user?: { id: string; name: string };
  user_name?: string;
  rating: number;
  title: string | null;
  content: string;
  created_at: string;
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  content: string;
}

// Cart (client-only, matches Order items shape for checkout)
export interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
}

// Orders
export interface OrderItem {
  id: string;
  product_id: string;
  title: string;
  price: number | string;
  currency: string;
  quantity: number;
  line_total: string;
  /** When API includes product media (OrderItemResource / snapshots). */
  primary_image?: ProductImage | null;
  /** Flat preview URL from API (optional). */
  image_url?: string | null;
}

export interface Order {
  id: string;
  status: string;
  status_label: string;
  total_amount: number | string;
  currency: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_zip: string | null;
  payment_method: string;
  payment_status: string;
  payment_status_label: string;
  transaction_id: string | null;
  notes: string | null;
  paid_at?: string | null;
  items: OrderItem[];
  sellers?: { id: string; name: string }[];
  created_at: string;
  updated_at: string;
}

export interface CreateOrderData {
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address: string;
  shipping_city: string;
  shipping_country: string;
  shipping_zip?: string;
  notes?: string;
  items: { product_id: string; quantity: number }[];
}

export interface OrderPayCheckoutData {
  checkout_required: true;
  checkout_url: string;
  checkout_session_marker: string | null;
}

export interface OrderPayPaymentSheetData {
  payment_sheet_required: true;
  payment_intent_client_secret: string;
}

export type OrderPayResult = Order | OrderPayCheckoutData | OrderPayPaymentSheetData;

export function isOrderPayCheckout(data: OrderPayResult): data is OrderPayCheckoutData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'checkout_required' in data &&
    (data as OrderPayCheckoutData).checkout_required === true
  );
}

export function isOrderPayPaymentSheet(data: OrderPayResult): data is OrderPayPaymentSheetData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'payment_sheet_required' in data &&
    (data as OrderPayPaymentSheetData).payment_sheet_required === true &&
    typeof (data as OrderPayPaymentSheetData).payment_intent_client_secret === 'string'
  );
}

// Addresses
export interface ShippingAddress {
  id: string;
  label: string | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zip: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAddressData {
  label?: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  country: string;
  zip?: string;
  is_default?: boolean;
}

export interface UpdateAddressData extends Partial<CreateAddressData> {}

// Auth
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  country: string | null;
  email_verified_at: string | null;
  roles: string[];
  /** When false, user is hidden from messenger contact search. */
  messenger_searchable?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

// Home
export interface HomeData {
  categories: Category[];
  new_products: Product[];
  popular_products: Product[];
  /** First page of popular-by-reviews grid (same as infinite list seed). */
  popular_grid_first_page?: {
    data: Product[];
    meta: PaginatedMeta;
  };
}

// Product page (product + reviews + featured)
export interface ProductPageData {
  product: Product;
  reviews: { data: Review[]; meta: { total: number; per_page: number; current_page: number; last_page: number } };
  featured: Product[];
}

// Category page
export interface CategoryPageData {
  category: Category;
  products: {
    data: Product[];
    meta: { total: number; per_page: number; current_page: number; last_page: number };
  };
}

// Seller / Company
export interface CompanyReview {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  created_at: string;
}

export interface MainCategory {
  id: string;
  name: string;
  slug: string | null;
  products_count: number;
}

export interface SellerProfile {
  id: string;
  name: string;
  legal_name?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  is_premium_plus?: boolean;
  profile_theme?: 'tech' | 'soft' | 'neutral' | 'kids' | null;
  logo_url?: string | null;
  header_background_url?: string | null;
  profile_description?: string | null;
  profile_services?: string | null;
  profile_certificates?: string | null;
  profile_quality_control?: string | null;
  profile_trade_experience?: string | null;
  profile_capabilities?: string | null;
  company_reviews?: CompanyReview[];
  company_rating_avg?: number | null;
  main_categories?: MainCategory[];
  preview_products?: Product[];
}

// Support tickets (match backend enums)
export type TicketChannel = 'seller' | 'platform';
export type TicketCategory =
  | 'company_verification'
  | 'product_moderation'
  | 'import_errors'
  | 'technical_issue'
  | 'general_question'
  | 'order_issue';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketMessage {
  id: string;
  author_type: string;
  author_name?: string;
  content: string;
  visibility?: string;
  created_at: string;
}

export interface TicketResource {
  id: string;
  channel: TicketChannel;
  channel_label?: string;
  subject: string;
  category: TicketCategory;
  category_label?: string;
  priority: TicketPriority;
  priority_label?: string;
  status: string;
  status_label?: string;
  messages?: TicketMessage[];
  message_count?: number;
  company?: { id: string; name: string } | null;
  user?: User | null;
  order_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTicketData {
  channel: TicketChannel;
  subject: string;
  message: string;
  category: TicketCategory;
  priority?: TicketPriority;
  company_id?: string;
  order_id?: string;
  requester_email?: string;
  requester_phone?: string;
}

// Analytics
export type AnalyticsEventType =
  | 'ProductViewed'
  | 'ProductPhotoViewed'
  | 'CategoryViewed'
  | 'SearchPerformed'
  | 'AddToCartClicked'
  | 'CheckoutStarted'
  | 'PaymentClicked'
  | 'VideoTimeToFirstFrame'
  | 'VideoCacheHit'
  | 'VideoCacheMiss'
  | 'VideoCacheEviction'
  | 'VideoDownloadFailed'
  | 'VideoPreloadCancelled'
  | 'VideoFormatDetected';

export interface TrackEventPayload {
  event_type: AnalyticsEventType;
  payload: Record<string, unknown>;
}
