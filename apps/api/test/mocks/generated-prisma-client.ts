export class PrismaClient {
  adminUser = {
    create: () => {
      throw new Error(
        'PrismaClient test mock create() was called unexpectedly.',
      );
    },
    findUnique: () => Promise.resolve(null),
    update: () => {
      throw new Error(
        'PrismaClient test mock update() was called unexpectedly.',
      );
    },
  };

  constructor() {}

  async $disconnect(): Promise<void> {}
}
