import { Module } from '@nestjs/common';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { Test, TestingModule } from '@nestjs/testing';
import { configureApp } from '../src/app.setup';
import { ProductsController } from '../src/modules/products/products.controller';
import { ProductsRepository } from '../src/modules/products/products.repository';
import { ProductsService } from '../src/modules/products/products.service';

interface ErrorResponseBody {
  error: {
    code: string;
    message: string;
    details?: Array<{
      field?: string;
      message: string;
    }>;
  };
}

describe('Public product listing endpoint (e2e)', () => {
  let productsRepository: {
    listPublicProducts: jest.Mock;
  };
  let app: NestFastifyApplication;

  beforeEach(async () => {
    productsRepository = {
      listPublicProducts: jest.fn(),
    };

    @Module({
      controllers: [ProductsController],
      providers: [
        ProductsService,
        {
          provide: ProductsRepository,
          useValue: productsRepository,
        },
      ],
    })
    class PublicProductListingTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PublicProductListingTestModule],
    }).compile();

    app = moduleFixture.createNestApplication<NestFastifyApplication>(
      new FastifyAdapter(),
    );
    configureApp(app);
    await app.init();
    await app.getHttpAdapter().getInstance().ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('lists public products and forwards pagination and category filters', async () => {
    productsRepository.listPublicProducts.mockResolvedValue({
      products: [
        {
          id: 'product_1',
          name: 'Classic Black Dress',
          description: 'An elegant evening silhouette.',
          category: 'Dresses',
          priceAmount: 12500,
          mainMedia: {
            id: 'media_1',
            url: 'https://cdn.example.com/products/classic-black-dress.jpg',
            altText: 'Classic Black Dress front view',
            isMain: true,
            displayOrder: 1,
          },
        },
      ],
      pagination: {
        page: 2,
        pageSize: 1,
        totalItems: 3,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/catalog/products?page=2&pageSize=1&category=Dresses',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      products: [
        {
          id: 'product_1',
          name: 'Classic Black Dress',
          description: 'An elegant evening silhouette.',
          category: 'Dresses',
          priceAmount: 12500,
          mainMedia: {
            id: 'media_1',
            url: 'https://cdn.example.com/products/classic-black-dress.jpg',
            altText: 'Classic Black Dress front view',
            isMain: true,
            displayOrder: 1,
          },
        },
      ],
      pagination: {
        page: 2,
        pageSize: 1,
        totalItems: 3,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });
    expect(productsRepository.listPublicProducts).toHaveBeenCalledWith({
      page: 2,
      pageSize: 1,
      category: 'Dresses',
    });
  });

  it('uses stable default pagination when no query params are provided', async () => {
    productsRepository.listPublicProducts.mockResolvedValue({
      products: [],
      pagination: {
        page: 1,
        pageSize: 20,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    const response = await app.inject({
      method: 'GET',
      url: '/catalog/products',
    });

    expect(response.statusCode).toBe(200);
    expect(productsRepository.listPublicProducts).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      category: undefined,
    });
  });

  it('validates pagination and category query params', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/catalog/products?page=0&pageSize=101&category=',
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(400);
    expect(body).toMatchObject({
      error: {
        code: 'ValidationFailed',
        message: 'Validation failed',
      },
    });
    expect(body.error.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: 'page',
        }),
        expect.objectContaining({
          field: 'pageSize',
        }),
        expect.objectContaining({
          field: 'category',
        }),
      ]),
    );
    expect(productsRepository.listPublicProducts).not.toHaveBeenCalled();
  });
});

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}
