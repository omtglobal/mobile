/**
 * Simple validation helpers for forms
 */

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function minLength(value: string, min: number): boolean {
  return value.length >= min;
}
