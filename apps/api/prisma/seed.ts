import 'dotenv/config';

import { scryptSync } from 'node:crypto';

import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from '../generated/prisma/client.js';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL must be set before running the development seed script.',
  );
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const devPassword = 'SecurePass123!';

const seedIds = {
  adminUser: 'seed-admin-user',
  staffUser: 'seed-staff-user',
  products: {
    signatureSet: 'seed-product-signature-set',
    tailoredBlazer: 'seed-product-tailored-blazer',
    classicBlackDress: 'seed-product-classic-black-dress',
    linenTwoPiece: 'seed-product-linen-two-piece',
    cottonShirt: 'seed-product-cotton-shirt',
  },
  variants: {
    signatureSetMGrey: 'seed-variant-signature-set-m-grey',
    tailoredBlazerSBlack: 'seed-variant-tailored-blazer-s-black',
    tailoredBlazerMBlack: 'seed-variant-tailored-blazer-m-black',
    tailoredBlazerLBlack: 'seed-variant-tailored-blazer-l-black',
    classicBlackDressSBlack: 'seed-variant-classic-black-dress-s-black',
    classicBlackDressMBlack: 'seed-variant-classic-black-dress-m-black',
    linenTwoPieceSBeige: 'seed-variant-linen-two-piece-s-beige',
    linenTwoPieceMBeige: 'seed-variant-linen-two-piece-m-beige',
    linenTwoPieceLBeige: 'seed-variant-linen-two-piece-l-beige',
    cottonShirtMWhite: 'seed-variant-cotton-shirt-m-white',
  },
  media: {
    signatureSetMain: 'seed-media-signature-set-main',
    tailoredBlazerMain: 'seed-media-tailored-blazer-main',
    tailoredBlazerDetail: 'seed-media-tailored-blazer-detail',
    classicBlackDressMain: 'seed-media-classic-black-dress-main',
    linenTwoPieceMain: 'seed-media-linen-two-piece-main',
    cottonShirtMain: 'seed-media-cotton-shirt-main',
  },
  inventoryAdjustments: {
    cottonShirtRestock: 'seed-inventory-adjustment-cotton-shirt-restock',
    cottonShirtDamage: 'seed-inventory-adjustment-cotton-shirt-damage',
  },
  orders: {
    order001: 'seed-order-001',
    order1001: 'seed-order-1001',
  },
  orderItems: {
    order001SignatureSet: 'seed-order-item-001-signature-set',
    order1001TailoredBlazer: 'seed-order-item-1001-tailored-blazer',
  },
  notifications: {
    order1001Confirmed: 'seed-notification-order-1001-confirmed',
    order1001Ready: 'seed-notification-order-1001-ready',
  },
  notificationAttempts: {
    order1001ConfirmedSent:
      'seed-notification-attempt-order-1001-confirmed-sent',
  },
} as const;

function createPasswordHash(label: string): string {
  const salt = `solangebernard-dev-seed:${label}:v1`;
  const hash = scryptSync(devPassword, salt, 64).toString('hex');

  return `scrypt$${salt}$${hash}`;
}

async function seedAdminUsers() {
  const adminUser = await prisma.adminUser.upsert({
    where: { email: 'admin@solangebernard.com' },
    update: {
      passwordHash: createPasswordHash('admin'),
      role: 'admin',
      isActive: true,
    },
    create: {
      id: seedIds.adminUser,
      email: 'admin@solangebernard.com',
      passwordHash: createPasswordHash('admin'),
      role: 'admin',
      isActive: true,
    },
  });

  const staffUser = await prisma.adminUser.upsert({
    where: { email: 'staff@solangebernard.com' },
    update: {
      passwordHash: createPasswordHash('staff'),
      role: 'staff',
      isActive: true,
    },
    create: {
      id: seedIds.staffUser,
      email: 'staff@solangebernard.com',
      passwordHash: createPasswordHash('staff'),
      role: 'staff',
      isActive: true,
    },
  });

  return { adminUser, staffUser };
}

async function seedProducts() {
  await prisma.product.upsert({
    where: { id: seedIds.products.signatureSet },
    update: {
      name: 'Signature Set',
      description: 'Matching two-piece set used in the guest ordering flow.',
      category: 'Sets',
      priceAmount: 35000,
      status: 'Published',
    },
    create: {
      id: seedIds.products.signatureSet,
      name: 'Signature Set',
      description: 'Matching two-piece set used in the guest ordering flow.',
      category: 'Sets',
      priceAmount: 35000,
      status: 'Published',
    },
  });

  await prisma.product.upsert({
    where: { id: seedIds.products.tailoredBlazer },
    update: {
      name: 'Tailored Blazer',
      description: 'Structured blazer for the product detail and variant flow.',
      category: 'Blazers',
      priceAmount: 42000,
      status: 'Published',
    },
    create: {
      id: seedIds.products.tailoredBlazer,
      name: 'Tailored Blazer',
      description: 'Structured blazer for the product detail and variant flow.',
      category: 'Blazers',
      priceAmount: 42000,
      status: 'Published',
    },
  });

  await prisma.product.upsert({
    where: { id: seedIds.products.classicBlackDress },
    update: {
      name: 'Classic Black Dress',
      description:
        'Published dress for catalog browsing and category filtering.',
      category: 'Dresses',
      priceAmount: 28000,
      status: 'Published',
    },
    create: {
      id: seedIds.products.classicBlackDress,
      name: 'Classic Black Dress',
      description:
        'Published dress for catalog browsing and category filtering.',
      category: 'Dresses',
      priceAmount: 28000,
      status: 'Published',
    },
  });

  await prisma.product.upsert({
    where: { id: seedIds.products.linenTwoPiece },
    update: {
      name: 'Linen Two-Piece',
      description:
        'Lightweight set kept in draft for back-office editing flows.',
      category: 'Sets',
      priceAmount: 35000,
      status: 'Draft',
    },
    create: {
      id: seedIds.products.linenTwoPiece,
      name: 'Linen Two-Piece',
      description:
        'Lightweight set kept in draft for back-office editing flows.',
      category: 'Sets',
      priceAmount: 35000,
      status: 'Draft',
    },
  });

  await prisma.product.upsert({
    where: { id: seedIds.products.cottonShirt },
    update: {
      name: 'Cotton Shirt',
      description: 'Published shirt with inventory adjustment history.',
      category: 'Shirts',
      priceAmount: 18000,
      status: 'Published',
    },
    create: {
      id: seedIds.products.cottonShirt,
      name: 'Cotton Shirt',
      description: 'Published shirt with inventory adjustment history.',
      category: 'Shirts',
      priceAmount: 18000,
      status: 'Published',
    },
  });
}

async function seedVariants() {
  await prisma.productVariant.upsert({
    where: { sku: 'SIGNATURE-SET-M-GREY' },
    update: {
      productId: seedIds.products.signatureSet,
      size: 'M',
      color: 'Grey',
      variantLabel: 'M / Grey',
      stock: 4,
    },
    create: {
      id: seedIds.variants.signatureSetMGrey,
      productId: seedIds.products.signatureSet,
      sku: 'SIGNATURE-SET-M-GREY',
      size: 'M',
      color: 'Grey',
      variantLabel: 'M / Grey',
      stock: 4,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'TAILORED-BLAZER-S-BLACK' },
    update: {
      productId: seedIds.products.tailoredBlazer,
      size: 'S',
      color: 'Black',
      variantLabel: 'S / Black',
      stock: 3,
    },
    create: {
      id: seedIds.variants.tailoredBlazerSBlack,
      productId: seedIds.products.tailoredBlazer,
      sku: 'TAILORED-BLAZER-S-BLACK',
      size: 'S',
      color: 'Black',
      variantLabel: 'S / Black',
      stock: 3,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'TAILORED-BLAZER-M-BLACK' },
    update: {
      productId: seedIds.products.tailoredBlazer,
      size: 'M',
      color: 'Black',
      variantLabel: 'M / Black',
      stock: 0,
    },
    create: {
      id: seedIds.variants.tailoredBlazerMBlack,
      productId: seedIds.products.tailoredBlazer,
      sku: 'TAILORED-BLAZER-M-BLACK',
      size: 'M',
      color: 'Black',
      variantLabel: 'M / Black',
      stock: 0,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'TAILORED-BLAZER-L-BLACK' },
    update: {
      productId: seedIds.products.tailoredBlazer,
      size: 'L',
      color: 'Black',
      variantLabel: 'L / Black',
      stock: 2,
    },
    create: {
      id: seedIds.variants.tailoredBlazerLBlack,
      productId: seedIds.products.tailoredBlazer,
      sku: 'TAILORED-BLAZER-L-BLACK',
      size: 'L',
      color: 'Black',
      variantLabel: 'L / Black',
      stock: 2,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'CLASSIC-BLACK-DRESS-S-BLACK' },
    update: {
      productId: seedIds.products.classicBlackDress,
      size: 'S',
      color: 'Black',
      variantLabel: 'S / Black',
      stock: 6,
    },
    create: {
      id: seedIds.variants.classicBlackDressSBlack,
      productId: seedIds.products.classicBlackDress,
      sku: 'CLASSIC-BLACK-DRESS-S-BLACK',
      size: 'S',
      color: 'Black',
      variantLabel: 'S / Black',
      stock: 6,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'CLASSIC-BLACK-DRESS-M-BLACK' },
    update: {
      productId: seedIds.products.classicBlackDress,
      size: 'M',
      color: 'Black',
      variantLabel: 'M / Black',
      stock: 3,
    },
    create: {
      id: seedIds.variants.classicBlackDressMBlack,
      productId: seedIds.products.classicBlackDress,
      sku: 'CLASSIC-BLACK-DRESS-M-BLACK',
      size: 'M',
      color: 'Black',
      variantLabel: 'M / Black',
      stock: 3,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'LINEN-TWO-PIECE-S-BEIGE' },
    update: {
      productId: seedIds.products.linenTwoPiece,
      size: 'S',
      color: 'Beige',
      variantLabel: 'S / Beige',
      stock: 2,
    },
    create: {
      id: seedIds.variants.linenTwoPieceSBeige,
      productId: seedIds.products.linenTwoPiece,
      sku: 'LINEN-TWO-PIECE-S-BEIGE',
      size: 'S',
      color: 'Beige',
      variantLabel: 'S / Beige',
      stock: 2,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'LINEN-TWO-PIECE-M-BEIGE' },
    update: {
      productId: seedIds.products.linenTwoPiece,
      size: 'M',
      color: 'Beige',
      variantLabel: 'M / Beige',
      stock: 4,
    },
    create: {
      id: seedIds.variants.linenTwoPieceMBeige,
      productId: seedIds.products.linenTwoPiece,
      sku: 'LINEN-TWO-PIECE-M-BEIGE',
      size: 'M',
      color: 'Beige',
      variantLabel: 'M / Beige',
      stock: 4,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'LINEN-TWO-PIECE-L-BEIGE' },
    update: {
      productId: seedIds.products.linenTwoPiece,
      size: 'L',
      color: 'Beige',
      variantLabel: 'L / Beige',
      stock: 1,
    },
    create: {
      id: seedIds.variants.linenTwoPieceLBeige,
      productId: seedIds.products.linenTwoPiece,
      sku: 'LINEN-TWO-PIECE-L-BEIGE',
      size: 'L',
      color: 'Beige',
      variantLabel: 'L / Beige',
      stock: 1,
    },
  });

  await prisma.productVariant.upsert({
    where: { sku: 'COTTON-SHIRT-M-WHITE' },
    update: {
      productId: seedIds.products.cottonShirt,
      size: 'M',
      color: 'White',
      variantLabel: 'M / White',
      stock: 13,
    },
    create: {
      id: seedIds.variants.cottonShirtMWhite,
      productId: seedIds.products.cottonShirt,
      sku: 'COTTON-SHIRT-M-WHITE',
      size: 'M',
      color: 'White',
      variantLabel: 'M / White',
      stock: 13,
    },
  });
}

async function seedMedia() {
  await prisma.productMedia.upsert({
    where: { id: seedIds.media.signatureSetMain },
    update: {
      productId: seedIds.products.signatureSet,
      url: 'https://cdn.solangebernard.dev/products/signature-set/main.jpg',
      altText: 'Signature Set main photo',
      isMain: true,
      displayOrder: 1,
    },
    create: {
      id: seedIds.media.signatureSetMain,
      productId: seedIds.products.signatureSet,
      url: 'https://cdn.solangebernard.dev/products/signature-set/main.jpg',
      altText: 'Signature Set main photo',
      isMain: true,
      displayOrder: 1,
    },
  });

  await prisma.productMedia.upsert({
    where: { id: seedIds.media.tailoredBlazerMain },
    update: {
      productId: seedIds.products.tailoredBlazer,
      url: 'https://cdn.solangebernard.dev/products/tailored-blazer/main.jpg',
      altText: 'Tailored Blazer main photo',
      isMain: true,
      displayOrder: 1,
    },
    create: {
      id: seedIds.media.tailoredBlazerMain,
      productId: seedIds.products.tailoredBlazer,
      url: 'https://cdn.solangebernard.dev/products/tailored-blazer/main.jpg',
      altText: 'Tailored Blazer main photo',
      isMain: true,
      displayOrder: 1,
    },
  });

  await prisma.productMedia.upsert({
    where: { id: seedIds.media.tailoredBlazerDetail },
    update: {
      productId: seedIds.products.tailoredBlazer,
      url: 'https://cdn.solangebernard.dev/products/tailored-blazer/detail.jpg',
      altText: 'Tailored Blazer detail photo',
      isMain: false,
      displayOrder: 2,
    },
    create: {
      id: seedIds.media.tailoredBlazerDetail,
      productId: seedIds.products.tailoredBlazer,
      url: 'https://cdn.solangebernard.dev/products/tailored-blazer/detail.jpg',
      altText: 'Tailored Blazer detail photo',
      isMain: false,
      displayOrder: 2,
    },
  });

  await prisma.productMedia.upsert({
    where: { id: seedIds.media.classicBlackDressMain },
    update: {
      productId: seedIds.products.classicBlackDress,
      url: 'https://cdn.solangebernard.dev/products/classic-black-dress/main.jpg',
      altText: 'Classic Black Dress main photo',
      isMain: true,
      displayOrder: 1,
    },
    create: {
      id: seedIds.media.classicBlackDressMain,
      productId: seedIds.products.classicBlackDress,
      url: 'https://cdn.solangebernard.dev/products/classic-black-dress/main.jpg',
      altText: 'Classic Black Dress main photo',
      isMain: true,
      displayOrder: 1,
    },
  });

  await prisma.productMedia.upsert({
    where: { id: seedIds.media.linenTwoPieceMain },
    update: {
      productId: seedIds.products.linenTwoPiece,
      url: 'https://cdn.solangebernard.dev/products/linen-two-piece/main.jpg',
      altText: 'Linen Two-Piece main photo',
      isMain: true,
      displayOrder: 1,
    },
    create: {
      id: seedIds.media.linenTwoPieceMain,
      productId: seedIds.products.linenTwoPiece,
      url: 'https://cdn.solangebernard.dev/products/linen-two-piece/main.jpg',
      altText: 'Linen Two-Piece main photo',
      isMain: true,
      displayOrder: 1,
    },
  });

  await prisma.productMedia.upsert({
    where: { id: seedIds.media.cottonShirtMain },
    update: {
      productId: seedIds.products.cottonShirt,
      url: 'https://cdn.solangebernard.dev/products/cotton-shirt/main.jpg',
      altText: 'Cotton Shirt main photo',
      isMain: true,
      displayOrder: 1,
    },
    create: {
      id: seedIds.media.cottonShirtMain,
      productId: seedIds.products.cottonShirt,
      url: 'https://cdn.solangebernard.dev/products/cotton-shirt/main.jpg',
      altText: 'Cotton Shirt main photo',
      isMain: true,
      displayOrder: 1,
    },
  });
}

async function seedInventoryAdjustments(actorAdminUserId: string) {
  await prisma.inventoryAdjustment.upsert({
    where: { id: seedIds.inventoryAdjustments.cottonShirtRestock },
    update: {
      productId: seedIds.products.cottonShirt,
      productVariantId: seedIds.variants.cottonShirtMWhite,
      actorAdminUserId,
      quantityDelta: 10,
      reason: 'New shipment',
    },
    create: {
      id: seedIds.inventoryAdjustments.cottonShirtRestock,
      productId: seedIds.products.cottonShirt,
      productVariantId: seedIds.variants.cottonShirtMWhite,
      actorAdminUserId,
      quantityDelta: 10,
      reason: 'New shipment',
    },
  });

  await prisma.inventoryAdjustment.upsert({
    where: { id: seedIds.inventoryAdjustments.cottonShirtDamage },
    update: {
      productId: seedIds.products.cottonShirt,
      productVariantId: seedIds.variants.cottonShirtMWhite,
      actorAdminUserId,
      quantityDelta: -2,
      reason: 'Damaged items',
    },
    create: {
      id: seedIds.inventoryAdjustments.cottonShirtDamage,
      productId: seedIds.products.cottonShirt,
      productVariantId: seedIds.variants.cottonShirtMWhite,
      actorAdminUserId,
      quantityDelta: -2,
      reason: 'Damaged items',
    },
  });
}

async function seedOrders() {
  const order001 = await prisma.order.upsert({
    where: { orderReference: 'ORD-001' },
    update: {
      status: 'PendingConfirmation',
      customerFullName: 'Awa Konan',
      customerPhone: '+2250102030405',
      deliveryArea: 'Cocody',
      deliveryAddress: 'Riviera Palmeraie',
      internalNotes: 'Customer asked for afternoon delivery',
    },
    create: {
      id: seedIds.orders.order001,
      orderReference: 'ORD-001',
      status: 'PendingConfirmation',
      customerFullName: 'Awa Konan',
      customerPhone: '+2250102030405',
      deliveryArea: 'Cocody',
      deliveryAddress: 'Riviera Palmeraie',
      internalNotes: 'Customer asked for afternoon delivery',
    },
  });

  const order1001 = await prisma.order.upsert({
    where: { orderReference: 'ORD-1001' },
    update: {
      status: 'ReadyForDelivery',
      customerFullName: 'Awa Konan',
      customerPhone: '+2250102030405',
      deliveryArea: 'Plateau',
      deliveryAddress: 'Avenue Chardy',
      internalNotes: 'Ready for afternoon dispatch',
    },
    create: {
      id: seedIds.orders.order1001,
      orderReference: 'ORD-1001',
      status: 'ReadyForDelivery',
      customerFullName: 'Awa Konan',
      customerPhone: '+2250102030405',
      deliveryArea: 'Plateau',
      deliveryAddress: 'Avenue Chardy',
      internalNotes: 'Ready for afternoon dispatch',
    },
  });

  await prisma.orderItem.upsert({
    where: { id: seedIds.orderItems.order001SignatureSet },
    update: {
      orderId: order001.id,
      productId: seedIds.products.signatureSet,
      productVariantId: seedIds.variants.signatureSetMGrey,
      productNameSnapshot: 'Signature Set',
      variantLabelSnapshot: 'M / Grey',
      unitPriceAmount: 35000,
      quantity: 1,
    },
    create: {
      id: seedIds.orderItems.order001SignatureSet,
      orderId: order001.id,
      productId: seedIds.products.signatureSet,
      productVariantId: seedIds.variants.signatureSetMGrey,
      productNameSnapshot: 'Signature Set',
      variantLabelSnapshot: 'M / Grey',
      unitPriceAmount: 35000,
      quantity: 1,
    },
  });

  await prisma.orderItem.upsert({
    where: { id: seedIds.orderItems.order1001TailoredBlazer },
    update: {
      orderId: order1001.id,
      productId: seedIds.products.tailoredBlazer,
      productVariantId: seedIds.variants.tailoredBlazerSBlack,
      productNameSnapshot: 'Tailored Blazer',
      variantLabelSnapshot: 'S / Black',
      unitPriceAmount: 42000,
      quantity: 1,
    },
    create: {
      id: seedIds.orderItems.order1001TailoredBlazer,
      orderId: order1001.id,
      productId: seedIds.products.tailoredBlazer,
      productVariantId: seedIds.variants.tailoredBlazerSBlack,
      productNameSnapshot: 'Tailored Blazer',
      variantLabelSnapshot: 'S / Black',
      unitPriceAmount: 42000,
      quantity: 1,
    },
  });

  return { order001, order1001 };
}

async function seedNotifications(
  orderId: string,
  triggeredByAdminUserId: string,
) {
  await prisma.notification.upsert({
    where: { id: seedIds.notifications.order1001Confirmed },
    update: {
      orderId,
      relatedOrderStatus: 'Confirmed',
      triggerEvent: 'OrderStatusChanged',
      status: 'Sent',
      channel: 'SMS',
      recipientName: 'Awa Konan',
      recipientPhone: '+2250102030405',
      triggeredByAdminUserId,
    },
    create: {
      id: seedIds.notifications.order1001Confirmed,
      orderId,
      relatedOrderStatus: 'Confirmed',
      triggerEvent: 'OrderStatusChanged',
      status: 'Sent',
      channel: 'SMS',
      recipientName: 'Awa Konan',
      recipientPhone: '+2250102030405',
      triggeredByAdminUserId,
    },
  });

  await prisma.notification.upsert({
    where: { id: seedIds.notifications.order1001Ready },
    update: {
      orderId,
      relatedOrderStatus: 'ReadyForDelivery',
      triggerEvent: 'OrderStatusChanged',
      status: 'Queued',
      channel: 'SMS',
      recipientName: 'Awa Konan',
      recipientPhone: '+2250102030405',
      triggeredByAdminUserId,
    },
    create: {
      id: seedIds.notifications.order1001Ready,
      orderId,
      relatedOrderStatus: 'ReadyForDelivery',
      triggerEvent: 'OrderStatusChanged',
      status: 'Queued',
      channel: 'SMS',
      recipientName: 'Awa Konan',
      recipientPhone: '+2250102030405',
      triggeredByAdminUserId,
    },
  });

  await prisma.notificationAttempt.upsert({
    where: { id: seedIds.notificationAttempts.order1001ConfirmedSent },
    update: {
      notificationId: seedIds.notifications.order1001Confirmed,
      outcome: 'Sent',
      providerReference: 'seed-provider-ref-1001-confirmed',
      providerResponseCode: '200',
      providerMessage: 'Seeded notification attempt delivered successfully.',
    },
    create: {
      id: seedIds.notificationAttempts.order1001ConfirmedSent,
      notificationId: seedIds.notifications.order1001Confirmed,
      outcome: 'Sent',
      providerReference: 'seed-provider-ref-1001-confirmed',
      providerResponseCode: '200',
      providerMessage: 'Seeded notification attempt delivered successfully.',
    },
  });
}

async function main() {
  const { adminUser, staffUser } = await seedAdminUsers();

  await seedProducts();
  await seedVariants();
  await seedMedia();
  await seedInventoryAdjustments(staffUser.id);

  const { order1001 } = await seedOrders();

  await seedNotifications(order1001.id, staffUser.id);

  const [productCount, orderCount, notificationCount] = await Promise.all([
    prisma.product.count({
      where: { id: { in: Object.values(seedIds.products) } },
    }),
    prisma.order.count({
      where: { orderReference: { in: ['ORD-001', 'ORD-1001'] } },
    }),
    prisma.notification.count({
      where: {
        id: {
          in: [
            seedIds.notifications.order1001Confirmed,
            seedIds.notifications.order1001Ready,
          ],
        },
      },
    }),
  ]);

  console.info('Seed complete.');
  console.info(`Admin login: ${adminUser.email} / ${devPassword}`);
  console.info(`Staff login: ${staffUser.email} / ${devPassword}`);
  console.info(`Seeded products: ${productCount}`);
  console.info(`Seeded orders: ${orderCount}`);
  console.info(`Seeded notifications: ${notificationCount}`);
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed.');
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
