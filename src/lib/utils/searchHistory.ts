import { mmkv } from '~/lib/utils/storage';

const SEARCH_HISTORY_KEY = 'search_history';
const MAX_ITEMS = 10;

export function getSearchHistory(): string[] {
  try {
    const raw = mmkv.getString(SEARCH_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addSearchHistory(query: string): void {
  if (!query?.trim()) return;
  const trimmed = query.trim();
  const current = getSearchHistory();
  const filtered = current.filter((q) => q.toLowerCase() !== trimmed.toLowerCase());
  const next = [trimmed, ...filtered].slice(0, MAX_ITEMS);
  mmkv.set(SEARCH_HISTORY_KEY, JSON.stringify(next));
}

export function removeSearchHistory(query: string): void {
  const current = getSearchHistory();
  const next = current.filter((q) => q !== query);
  mmkv.set(SEARCH_HISTORY_KEY, JSON.stringify(next));
}

export function clearSearchHistory(): void {
  mmkv.remove(SEARCH_HISTORY_KEY);
}
