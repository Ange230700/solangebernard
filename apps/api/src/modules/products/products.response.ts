import type {
  ListPublicProductsResponse,
  ProductMedia,
  PublicProductSummary,
} from '@repo/contracts';
import { mapCollectionResponse } from '../../common/responses/response-mapping';
import type { ListPublicProductsResult } from './products.types';

export function mapListPublicProductsResponse(
  result: ListPublicProductsResult,
): ListPublicProductsResponse {
  return mapCollectionResponse(
    'products',
    result.products,
    mapPublicProductSummary,
    result.pagination,
  );
}

function mapPublicProductSummary(
  product: PublicProductSummary,
): PublicProductSummary {
  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    priceAmount: product.priceAmount,
    mainMedia: mapProductMedia(product.mainMedia),
  };
}

function mapProductMedia(media: ProductMedia): ProductMedia {
  return {
    id: media.id,
    url: media.url,
    altText: media.altText,
    isMain: media.isMain,
    displayOrder: media.displayOrder,
  };
}
