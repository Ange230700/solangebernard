import type {
  PaginationMeta,
  ProductMedia,
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

@Injectable()
export class ProductsRepository {
  constructor(
    @Inject(PRISMA_CLIENT)
    private readonly prisma: ProductsPersistenceClient,
  ) {}

  async listPublicProducts(
    params: ListPublicProductsParams,
  ): Promise<ListPublicProductsResult> {
    const where = {
      status: PUBLISHED_PRODUCT_STATUS,
      ...(params.category ? { category: params.category } : {}),
      priceAmount: {
        not: null,
      },
      media: {
        some: {},
      },
    };

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

function mapProductMedia(media: StoredProductMedia): ProductMedia {
  return {
    id: media.id,
    url: media.url,
    altText: media.altText,
    isMain: media.isMain,
    displayOrder: media.displayOrder,
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
