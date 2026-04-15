import { formatPrice, formatDate, formatDateTime } from '~/lib/utils/format';

describe('formatPrice', () => {
  it('formats USD', () => {
    expect(formatPrice(99.99, 'USD')).toMatch(/\$99\.99/);
  });

  it('formats zero', () => {
    expect(formatPrice(0, 'USD')).toMatch(/\$0\.00/);
  });

  it('handles string amount', () => {
    expect(formatPrice('49.50', 'USD')).toMatch(/\$49\.50/);
  });

  it('returns dash for NaN', () => {
    expect(formatPrice(NaN, 'USD')).toBe('—');
    expect(formatPrice('invalid', 'USD')).toBe('—');
  });

  it('defaults to USD when currency omitted', () => {
    expect(formatPrice(10)).toMatch(/\$10\.00/);
  });
});

describe('formatDate', () => {
  it('formats date string', () => {
    const result = formatDate('2026-03-13T12:00:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('—');
  });

  it('returns dash for invalid date', () => {
    expect(formatDate('invalid')).toBe('—');
  });
});

describe('formatDateTime', () => {
  it('formats date with time', () => {
    const result = formatDateTime('2026-03-13T14:30:00Z');
    expect(result).toBeTruthy();
    expect(result).not.toBe('—');
  });
});
