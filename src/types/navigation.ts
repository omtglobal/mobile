/**
 * Navigation param types for Expo Router
 */

export type RootStackParamList = {
  '(main)': undefined;
  '(auth)': undefined;
  product: { id: string };
  category: { id: string };
  seller: { id: string };
  search: undefined;
  checkout: undefined;
  order: { id: string };
  support: undefined;
  'support/new': undefined;
  'support/[id]': { id: string };
  addresses: undefined;
  'addresses/edit': { id?: string };
  settings: undefined;
};
