import type { PaginationMeta } from '@repo/contracts';
import { mapCollectionResponse, mapResponse } from './response-mapping';

describe('response mapping', () => {
  it('maps a single transport response explicitly', () => {
    expect(
      mapResponse({ isHealthy: true }, (result) => ({
        status: result.isHealthy ? 'ok' : 'down',
      })),
    ).toEqual({ status: 'ok' });
  });

  it('maps list-style responses with a stable resource key and pagination', () => {
    const pagination: PaginationMeta = {
      page: 2,
      pageSize: 10,
      totalItems: 12,
      totalPages: 2,
      hasNextPage: false,
      hasPreviousPage: true,
    };

    const response = mapCollectionResponse(
      'products',
      [
        { id: 'prod_1', name: 'Dress' },
        { id: 'prod_2', name: 'Shirt' },
      ],
      (product) => ({
        id: product.id,
        label: product.name,
      }),
      pagination,
    );

    expect(response).toEqual({
      products: [
        { id: 'prod_1', label: 'Dress' },
        { id: 'prod_2', label: 'Shirt' },
      ],
      pagination,
    });
    expect(response.pagination).not.toBe(pagination);
  });
});
