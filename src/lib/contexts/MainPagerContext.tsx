import { createContext, useContext, type ReactNode } from 'react';

export type MainPagerContextValue = {
  /** Switch to Sales tab and open product detail. */
  goToSalesAndProduct: (productId: string) => void;
  /** Switch to Messenger tab and open a conversation. */
  goToMessengerAndChat: (conversationId: string) => void;
};

const MainPagerContext = createContext<MainPagerContextValue | null>(null);

export function MainPagerProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: MainPagerContextValue;
}) {
  return <MainPagerContext.Provider value={value}>{children}</MainPagerContext.Provider>;
}

export function useMainPager(): MainPagerContextValue {
  const ctx = useContext(MainPagerContext);
  if (!ctx) {
    throw new Error('useMainPager must be used within MainPagerProvider');
  }
  return ctx;
}
