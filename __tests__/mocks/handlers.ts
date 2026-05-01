import { http, HttpResponse } from 'msw';

const API_BASE = 'http://localhost:8000/api/v1/client';

const mockCategory = {
  id: 'cat-1',
  name: 'Electronics',
  slug: 'electronics',
  description: null,
  parent_id: null,
  path: 'electronics',
  products_count: 10,
};

const mockProduct = {
  id: 'prod-1',
  title: 'Test Product',
  description: 'Test description',
  sku: 'SKU-001',
  price: 99.99,
  currency: 'USD',
  status: 'published',
  status_label: 'Published',
  stock_quantity: 10,
  attributes: {},
  category: mockCategory,
  company: { id: 'c1', name: 'Test Co', is_premium_plus: false },
  images: [],
  primary_image: null,
  rating_avg: null,
  review_count: 0,
  published_at: '2026-01-01T00:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

export const handlers = [
  http.get(`${API_BASE}/catalog/home`, () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: {
        categories: [mockCategory],
        new_products: [mockProduct],
        popular_products: [mockProduct],
        popular_grid_first_page: {
          data: [mockProduct],
          meta: { total: 50, per_page: 20, current_page: 1, last_page: 3 },
        },
      },
    })
  ),

  http.get(`${API_BASE}/catalog/products`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get('page') ?? 1);
    const perPage = Number(url.searchParams.get('per_page') ?? 20);
    return HttpResponse.json({
      success: true,
      message: 'OK',
      data: Array.from({ length: perPage }, (_, i) => ({
        ...mockProduct,
        id: `prod-${(page - 1) * perPage + i + 1}`,
        title: `Product ${(page - 1) * perPage + i + 1}`,
      })),
      meta: {
        total: 50,
        per_page: perPage,
        current_page: page,
        last_page: 3,
      },
    });
  }),

  http.get(`${API_BASE}/catalog/products/:id`, ({ params }) =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: { ...mockProduct, id: params.id },
    })
  ),

  http.get(`${API_BASE}/catalog/categories`, () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: [mockCategory],
    })
  ),

  http.post(`${API_BASE}/auth/login`, () =>
    HttpResponse.json({
      success: true,
      message: 'OK',
      data: {
        user: {
          id: 'u1',
          name: 'Test User',
          email: 'test@test.com',
          phone: null,
          country: null,
          email_verified_at: null,
          roles: ['buyer'],
        },
        access_token: 'mock-token',
        token_type: 'bearer',
        expires_in: 3600,
      },
    })
  ),
];
