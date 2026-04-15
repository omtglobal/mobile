/**
 * Laravel JsonResource::collection() wraps arrays in { data: T[] }.
 * Safely extract the inner array regardless of wrapping.
 */
export function unwrapLaravelCollectionToArray<T>(
  value: T[] | { data: T[] } | null | undefined
): T[] {
  if (value == null) return [];
  if (Array.isArray(value)) return value;
  if (typeof value === 'object' && 'data' in value) {
    const inner = (value as { data: T[] }).data;
    return Array.isArray(inner) ? inner : [];
  }
  return [];
}
