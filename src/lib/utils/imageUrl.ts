import { API_BASE_URL } from '~/constants/config';

/**
 * Resolves image URLs for display in the mobile app.
 *
 * - Relative URLs (e.g. /storage/...) are prefixed with API_BASE_URL
 * - localhost / 127.0.0.1 URLs are replaced with API_BASE_URL **host only**,
 *   preserving the original port so MinIO (9000) and API (8000) URLs both work.
 * - minio:9000 (Docker-internal) URLs are rewritten to the API host on port 9000.
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const base = API_BASE_URL.replace(/\/$/, '');

  // Relative URL — prepend base
  if (trimmed.startsWith('/')) {
    return `${base}${trimmed}`;
  }

  // Absolute URL — fix localhost / Docker-internal hostnames for emulator/device
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Extract the host (without port) from our API base
    const baseHost = extractHost(base);

    // Docker-internal minio hostname — replace with API host, keep port
    if (trimmed.includes('://minio:')) {
      return trimmed.replace(/https?:\/\/minio/, `${extractScheme(base)}://${baseHost}`);
    }

    // localhost / 127.0.0.1 — replace hostname only, keep original port
    if (
      (trimmed.includes('localhost') || trimmed.includes('127.0.0.1')) &&
      !base.includes('localhost') &&
      !base.includes('127.0.0.1')
    ) {
      return trimmed.replace(
        /https?:\/\/(localhost|127\.0\.0\.1)/,
        `${extractScheme(base)}://${baseHost}`,
      );
    }

    return trimmed;
  }

  return trimmed;
}

/** Extract hostname without port from a URL string. */
function extractHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    // Fallback regex for environments where URL constructor is unavailable
    const match = url.match(/https?:\/\/([^:/]+)/);
    return match?.[1] ?? 'localhost';
  }
}

/** Extract scheme (http or https) from a URL string. */
function extractScheme(url: string): string {
  return url.startsWith('https') ? 'https' : 'http';
}
