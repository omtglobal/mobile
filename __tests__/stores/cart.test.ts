import { act } from '@testing-library/react-native';
import { useCartStore } from '~/lib/stores/cart';
import type { Product } from '~/types/models';

const mockProduct: Product = {
  id: 'product-1',
  title: 'Test Product',
  description: 'Test',
  sku: 'SKU-1',
  price: 99.99,
  currency: 'USD',
  status: 'published',
  status_label: 'Published',
  stock_quantity: 10,
  attributes: {},
  category: null,
  company: null,
  images: [],
  primary_image: null,
  rating_avg: null,
  review_count: 0,
  published_at: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

describe('Cart Store', () => {
  beforeEach(() => {
    act(() => {
      useCartStore.getState().clearCart();
    });
  });

  it('adds item to cart', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 2);
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(2);
    expect(items[0].product_id).toBe('product-1');
  });

  it('increments quantity for existing item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 1);
      useCartStore.getState().addItem(mockProduct, 3);
    });
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].quantity).toBe(4);
  });

  it('removes item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 1);
    });
    expect(useCartStore.getState().items).toHaveLength(1);
    act(() => {
      useCartStore.getState().removeItem('product-1');
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('calculates totalPrice correctly', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 2);
    });
    const total = useCartStore.getState().totalPrice();
    expect(total).toBeCloseTo(199.98, 2);
  });

  it('calculates totalItems correctly', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 3);
    });
    expect(useCartStore.getState().totalItems()).toBe(3);
  });

  it('updateQuantity updates item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 2);
      useCartStore.getState().updateQuantity('product-1', 5);
    });
    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('updateQuantity to 0 removes item', () => {
    act(() => {
      useCartStore.getState().addItem(mockProduct, 1);
      useCartStore.getState().updateQuantity('product-1', 0);
    });
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});
