/**
 * Normalizes a messenger "find user" search string for the API.
 * - Email: lowercased (server matches case-insensitively, but this avoids duplicate requests).
 * - Phone: strip spaces, common separators; keep a single leading + and digits.
 */
export function normalizeMessagingSearchQuery(input: string): string {
  const t = input.trim();
  if (!t) return '';

  if (t.includes('@')) {
    return t.toLowerCase();
  }

  const digitCount = (t.match(/\d/g) ?? []).length;
  if (digitCount >= 2 && /^[\d\s+().\u00A0-]+$/.test(t)) {
    const compact = t.replace(/[\s\u00A0().-]/g, '');
    if (/^\+?\d{2,}$/.test(compact)) {
      return compact;
    }
  }

  return t;
}
