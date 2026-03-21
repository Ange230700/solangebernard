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

  adminSession = {
    create: () => {
      throw new Error(
        'PrismaClient test mock adminSession.create() was called unexpectedly.',
      );
    },
    findFirst: () => Promise.resolve(null),
  };

  constructor() {}

  async $disconnect(): Promise<void> {}
}
