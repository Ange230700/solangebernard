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

const PRODUCT_NOT_FOUND_CODE = 'ProductNotFound' as const;

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

describe('Public product detail endpoint (e2e)', () => {
  let productsRepository: {
    getPublicProduct: jest.Mock;
  };
  let app: NestFastifyApplication;

  beforeEach(async () => {
    productsRepository = {
      getPublicProduct: jest.fn(),
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
    class PublicProductDetailTestModule {}

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PublicProductDetailTestModule],
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

  it('returns the published product detail with media and variant availability', async () => {
    productsRepository.getPublicProduct.mockResolvedValue({
      id: 'product_1',
      name: 'Tailored Blazer',
      description: 'Structured blazer with satin lapels.',
      category: 'Jackets',
      priceAmount: 18900,
      mainMedia: {
        id: 'media_1',
        url: 'https://cdn.example.com/products/tailored-blazer-main.jpg',
        altText: 'Tailored blazer front view',
        isMain: true,
        displayOrder: 1,
      },
      media: [
        {
          id: 'media_1',
          url: 'https://cdn.example.com/products/tailored-blazer-main.jpg',
          altText: 'Tailored blazer front view',
          isMain: true,
          displayOrder: 1,
        },
        {
          id: 'media_2',
          url: 'https://cdn.example.com/products/tailored-blazer-detail.jpg',
          altText: 'Tailored blazer lapel detail',
          isMain: false,
          displayOrder: 2,
        },
      ],
      variants: [
        {
          id: 'variant_1',
          sku: 'TAILORED-BLAZER-S-BLK',
          size: 'S',
          color: 'Black',
          variantLabel: 'Black / S',
          stock: 3,
          inStock: true,
        },
        {
          id: 'variant_2',
          sku: 'TAILORED-BLAZER-M-BLK',
          size: 'M',
          color: 'Black',
          variantLabel: 'Black / M',
          stock: 0,
          inStock: false,
        },
      ],
    });

    const response = await app.inject({
      method: 'GET',
      url: '/catalog/products/product_1',
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      product: {
        id: 'product_1',
        name: 'Tailored Blazer',
        description: 'Structured blazer with satin lapels.',
        category: 'Jackets',
        priceAmount: 18900,
        mainMedia: {
          id: 'media_1',
          url: 'https://cdn.example.com/products/tailored-blazer-main.jpg',
          altText: 'Tailored blazer front view',
          isMain: true,
          displayOrder: 1,
        },
        media: [
          {
            id: 'media_1',
            url: 'https://cdn.example.com/products/tailored-blazer-main.jpg',
            altText: 'Tailored blazer front view',
            isMain: true,
            displayOrder: 1,
          },
          {
            id: 'media_2',
            url: 'https://cdn.example.com/products/tailored-blazer-detail.jpg',
            altText: 'Tailored blazer lapel detail',
            isMain: false,
            displayOrder: 2,
          },
        ],
        variants: [
          {
            id: 'variant_1',
            sku: 'TAILORED-BLAZER-S-BLK',
            size: 'S',
            color: 'Black',
            variantLabel: 'Black / S',
            stock: 3,
            inStock: true,
          },
          {
            id: 'variant_2',
            sku: 'TAILORED-BLAZER-M-BLK',
            size: 'M',
            color: 'Black',
            variantLabel: 'Black / M',
            stock: 0,
            inStock: false,
          },
        ],
      },
    });
    expect(productsRepository.getPublicProduct).toHaveBeenCalledWith(
      'product_1',
    );
  });

  it('returns a stable not-found error when the product is unpublished or missing', async () => {
    productsRepository.getPublicProduct.mockResolvedValue(null);

    const response = await app.inject({
      method: 'GET',
      url: '/catalog/products/product_404',
    });
    const body = parseJsonBody<ErrorResponseBody>(response.body);

    expect(response.statusCode).toBe(404);
    expect(body).toEqual({
      error: {
        code: PRODUCT_NOT_FOUND_CODE,
        message: 'Product not found.',
      },
    });
    expect(productsRepository.getPublicProduct).toHaveBeenCalledWith(
      'product_404',
    );
  });
});

function parseJsonBody<T>(body: string): T {
  return JSON.parse(body) as T;
}
