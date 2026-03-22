import { ProductsRepository } from './products.repository';

describe('ProductsRepository', () => {
  it('lists published products with pagination and category filtering', async () => {
    const count = jest.fn().mockResolvedValue(2);
    const findMany = jest.fn().mockResolvedValue([
      {
        id: 'product_1',
        name: 'Classic Black Dress',
        description: 'An elegant evening silhouette.',
        category: 'Dresses',
        priceAmount: 12500,
        media: [
          {
            id: 'media_2',
            url: 'https://cdn.example.com/products/classic-black-dress-side.jpg',
            altText: 'Classic Black Dress side view',
            isMain: false,
            displayOrder: 2,
          },
          {
            id: 'media_1',
            url: 'https://cdn.example.com/products/classic-black-dress-front.jpg',
            altText: 'Classic Black Dress front view',
            isMain: true,
            displayOrder: 1,
          },
        ],
      },
      {
        id: 'product_2',
        name: 'Tailored Ivory Suit',
        description: null,
        category: 'Dresses',
        priceAmount: 14900,
        media: [
          {
            id: 'media_3',
            url: 'https://cdn.example.com/products/tailored-ivory-suit.jpg',
            altText: null,
            isMain: false,
            displayOrder: 1,
          },
        ],
      },
    ]);
    const prisma = createPrismaServiceMock({
      count,
      findMany,
    });
    const repository = new ProductsRepository(prisma);

    await expect(
      repository.listPublicProducts({
        page: 1,
        pageSize: 2,
        category: 'Dresses',
      }),
    ).resolves.toEqual({
      products: [
        {
          id: 'product_1',
          name: 'Classic Black Dress',
          description: 'An elegant evening silhouette.',
          category: 'Dresses',
          priceAmount: 12500,
          mainMedia: {
            id: 'media_1',
            url: 'https://cdn.example.com/products/classic-black-dress-front.jpg',
            altText: 'Classic Black Dress front view',
            isMain: true,
            displayOrder: 1,
          },
        },
        {
          id: 'product_2',
          name: 'Tailored Ivory Suit',
          description: null,
          category: 'Dresses',
          priceAmount: 14900,
          mainMedia: {
            id: 'media_3',
            url: 'https://cdn.example.com/products/tailored-ivory-suit.jpg',
            altText: null,
            isMain: false,
            displayOrder: 1,
          },
        },
      ],
      pagination: {
        page: 1,
        pageSize: 2,
        totalItems: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
    expect(count).toHaveBeenCalledWith({
      where: {
        status: 'Published',
        category: 'Dresses',
        priceAmount: {
          not: null,
        },
        media: {
          some: {},
        },
      },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: {
        status: 'Published',
        category: 'Dresses',
        priceAmount: {
          not: null,
        },
        media: {
          some: {},
        },
      },
      skip: 0,
      take: 2,
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
    });
  });

  it('returns an empty page when no public products match', async () => {
    const count = jest.fn().mockResolvedValue(0);
    const findMany = jest.fn().mockResolvedValue([]);
    const prisma = createPrismaServiceMock({
      count,
      findMany,
    });
    const repository = new ProductsRepository(prisma);

    await expect(
      repository.listPublicProducts({
        page: 3,
        pageSize: 5,
      }),
    ).resolves.toEqual({
      products: [],
      pagination: {
        page: 3,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: true,
      },
    });
  });
});

function createPrismaServiceMock(overrides: {
  count?: jest.Mock;
  findMany?: jest.Mock;
}) {
  return {
    product: {
      count: overrides.count ?? jest.fn(),
      findMany: overrides.findMany ?? jest.fn(),
    },
  } as unknown as ConstructorParameters<typeof ProductsRepository>[0];
}
