/** Format `product.attributes` for specification tab (API may return nested objects). */

function formatValue(v: unknown): string {
  if (v == null) return '';
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (Array.isArray(v)) return v.map(formatValue).filter(Boolean).join(', ');
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function humanizeKey(key: string): string {
  const s = key.replace(/_/g, ' ').trim();
  if (!s) return key;
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

export function getProductSpecificationRows(
  attributes: Record<string, unknown> | undefined | null,
): { key: string; label: string; value: string }[] {
  if (!attributes || typeof attributes !== 'object') return [];
  const rows: { key: string; label: string; value: string }[] = [];
  for (const [k, v] of Object.entries(attributes)) {
    const value = formatValue(v);
    if (!value) continue;
    rows.push({ key: k, label: humanizeKey(k), value });
  }
  return rows.sort((a, b) => a.label.localeCompare(b.label));
}
