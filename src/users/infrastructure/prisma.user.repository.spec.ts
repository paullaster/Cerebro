import { PrismaUserRepository } from './prisma.user.repository.js';

describe('', () => {
  it('should be defined', () => {
    expect(new PrismaUserRepository('data')).toBeDefined();
  });
});
