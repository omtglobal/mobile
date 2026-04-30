import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { mmkvStorage } from '~/lib/utils/storage';
import type { CartItem, Product } from '~/types/models';

interface CartState {
  items: CartItem[];
  /** Product IDs deselected for checkout (user unchecked) */
  deselectedIds: string[];

  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleSelection: (productId: string) => void;
  clearCart: () => void;

  totalItems: () => number;
  totalPrice: () => number;
  selectedItems: () => CartItem[];
  selectedTotalPrice: () => number;
}

/** Zustand selector: total units (sum of line quantities). */
export const cartTotalQuantitySelector = (s: CartState) =>
  s.items.reduce((n, i) => n + i.quantity, 0);

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      deselectedIds: [],

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.product_id === product.id);
          const next = existing
            ? state.items.map((i) =>
                i.product_id === product.id ? { ...i, quantity: i.quantity + quantity } : i
              )
            : [...state.items, { product_id: product.id, product, quantity }];
          return { items: next };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.product_id !== productId),
          deselectedIds: state.deselectedIds.filter((id) => id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.product_id === productId ? { ...i, quantity } : i
          ),
        }));
      },

      toggleSelection: (productId) => {
        set((state) => ({
          deselectedIds: state.deselectedIds.includes(productId)
            ? state.deselectedIds.filter((id) => id !== productId)
            : [...state.deselectedIds, productId],
        }));
      },

      clearCart: () => set({ items: [], deselectedIds: [] }),

      totalItems: () => get().items.reduce((n, i) => n + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),

      selectedItems: () =>
        get().items.filter((i) => !get().deselectedIds.includes(i.product_id)),

      selectedTotalPrice: () =>
        get()
          .selectedItems()
          .reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
