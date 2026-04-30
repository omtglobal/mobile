import { useQueries } from '@tanstack/react-query';
import { catalogApi } from '~/lib/api/catalog';
import { queryKeys } from '~/constants/queryKeys';
import { resolveImageUrl } from '~/lib/utils/imageUrl';
import type { Product } from '~/types/models';

function thumbnailFromProduct(product: Product | undefined): string | null {
  if (!product) return null;
  const raw =
    product.primary_image?.thumbnail_url ??
    product.primary_image?.url ??
    product.images?.[0]?.thumbnail_url ??
    product.images?.[0]?.url ??
    null;
  return resolveImageUrl(raw);
}

/**
 * Fetches product details for the given IDs and returns a map of product_id → resolved thumbnail URL.
 * Used when order line items do not include embedded images from the API.
 */
export function useProductThumbnailsByIds(productIds: string[]): Record<string, string | null> {
  const queries = useQueries({
    queries: productIds.map((id) => ({
      queryKey: queryKeys.products.detail(id),
      queryFn: async () => {
        const res = await catalogApi.getProduct(id);
        return res.data;
      },
      staleTime: 15 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
      enabled: !!id,
    })),
  });

  const map: Record<string, string | null> = {};
  productIds.forEach((id, i) => {
    map[id] = thumbnailFromProduct(queries[i]?.data);
  });
  return map;
}
