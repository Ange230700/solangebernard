import type {
  PaginationMeta,
  ProductMedia,
  ProductVariant,
  PublicProductDetail,
  PublicProductSummary,
} from '@repo/contracts';
import { Inject, Injectable } from '@nestjs/common';
import { PRISMA_CLIENT } from '../../persistence/prisma.constants';
import type { PrismaService } from '../../persistence/prisma.service';
import type {
  ListPublicProductsParams,
  ListPublicProductsResult,
} from './products.types';

type ProductsPersistenceClient = Pick<PrismaService, 'product'>;
const PUBLISHED_PRODUCT_STATUS = 'Published' as const;

interface StoredProductMedia {
  id: string;
  url: string;
  altText: string | null;
  isMain: boolean;
  displayOrder: number | null;
}

interface StoredPublicProductSummary {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  priceAmount: number | null;
  media: StoredProductMedia[];
}

interface StoredProductVariant {
  id: string;
  sku: string;
  size: string | null;
  color: string | null;
  variantLabel: string;
  stock: number;
}

interface StoredPublicProductDetail extends StoredPublicProductSummary {
  variants: StoredProductVariant[];
}

@Injectable()
export class ProductsRepository {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly prisma: ProductsPersistenceClient,
  ) {}

  async listPublicProducts(
    params: ListPublicProductsParams,
  ): Promise<ListPublicProductsResult> {
    const where = createPublicProductWhere({
      category: params.category,
    });

    const [totalItems, products] = await Promise.all([
      this.prisma.product.count({
        where,
      }),
      this.prisma.product.findMany({
        where,
        skip: (params.page - 1) * params.pageSize,
        take: params.pageSize,
        orderBy: [{ createdAt: 'desc' }, { id: 'asc' }],
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          priceAmount: true,
          media: {
            select: {
              id: true,
              url: true,
              altText: true,
              isMain: true,
              displayOrder: true,
            },
            orderBy: [
              { isMain: 'desc' },
              { displayOrder: 'asc' },
              { createdAt: 'asc' },
              { id: 'asc' },
            ],
          },
        },
      }),
    ]);

    return {
      products: products.map((product) => mapPublicProductSummary(product)),
      pagination: createPaginationMeta(params, totalItems),
    };
  }

  async getPublicProduct(
    productId: string,
  ): Promise<PublicProductDetail | null> {
    const product = await this.prisma.product.findFirst({
      where: createPublicProductWhere({
        id: productId,
      }),
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        priceAmount: true,
        media: {
          select: {
            id: true,
            url: true,
            altText: true,
            isMain: true,
            displayOrder: true,
          },
          orderBy: [
            { isMain: 'desc' },
            { displayOrder: 'asc' },
            { createdAt: 'asc' },
            { id: 'asc' },
          ],
        },
        variants: {
          select: {
            id: true,
            sku: true,
            size: true,
            color: true,
            variantLabel: true,
            stock: true,
          },
          orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        },
      },
    });

    return product ? mapPublicProductDetail(product) : null;
  }
}

function mapPublicProductSummary(
  product: StoredPublicProductSummary,
): PublicProductSummary {
  if (product.priceAmount === null) {
    throw new Error('Public product listing requires a price amount.');
  }

  const mainMedia =
    product.media.find((media) => media.isMain) ?? product.media[0];

  if (!mainMedia) {
    throw new Error('Public product listing requires product media.');
  }

  return {
    id: product.id,
    name: product.name,
    description: product.description,
    category: product.category,
    priceAmount: product.priceAmount,
    mainMedia: mapProductMedia(mainMedia),
  };
}

function mapPublicProductDetail(
  product: StoredPublicProductDetail,
): PublicProductDetail {
  return {
    ...mapPublicProductSummary(product),
    media: product.media.map((media) => mapProductMedia(media)),
    variants: product.variants.map((variant) => mapProductVariant(variant)),
  };
}

function mapProductMedia(media: StoredProductMedia): ProductMedia {
  return {
    id: media.id,
    url: media.url,
    altText: media.altText,
    isMain: media.isMain,
    displayOrder: media.displayOrder,
  };
}

function mapProductVariant(variant: StoredProductVariant): ProductVariant {
  return {
    id: variant.id,
    sku: variant.sku,
    size: variant.size,
    color: variant.color,
    variantLabel: variant.variantLabel,
    stock: variant.stock,
    inStock: variant.stock > 0,
  };
}

function createPaginationMeta(
  params: ListPublicProductsParams,
  totalItems: number,
): PaginationMeta {
  const totalPages =
    totalItems === 0 ? 0 : Math.ceil(totalItems / params.pageSize);

  return {
    page: params.page,
    pageSize: params.pageSize,
    totalItems,
    totalPages,
    hasNextPage: params.page < totalPages,
    hasPreviousPage: params.page > 1,
  };
}

function createPublicProductWhere(filters: {
  category?: string | undefined;
  id?: string | undefined;
}) {
  return {
    ...(filters.id ? { id: filters.id } : {}),
    status: PUBLISHED_PRODUCT_STATUS,
    ...(filters.category ? { category: filters.category } : {}),
    priceAmount: {
      not: null,
    },
    media: {
      some: {},
    },
  };
}
