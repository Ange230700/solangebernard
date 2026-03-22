import type {
  GetPublicProductResponse,
  ListPublicProductsResponse,
  ProductMedia,
  ProductVariant,
  PublicProductDetail,
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

export function mapGetPublicProductResponse(
  product: PublicProductDetail,
): GetPublicProductResponse {
  return {
    product: mapPublicProductDetail(product),
  };
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

function mapPublicProductDetail(
  product: PublicProductDetail,
): PublicProductDetail {
  return {
    ...mapPublicProductSummary(product),
    media: product.media.map((media) => mapProductMedia(media)),
    variants: product.variants.map((variant) => mapProductVariant(variant)),
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

function mapProductVariant(variant: ProductVariant): ProductVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    variantLabel: variant.variantLabel,
    stock: variant.stock,
    inStock: variant.inStock,
  };
}
