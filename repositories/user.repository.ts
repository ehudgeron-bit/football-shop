import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

export type CreateUserData = {
  email: string;
  hashedPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
};

export const userRepository = {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { id } });
  },

  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({ data });
  },

  async exists(email: string): Promise<boolean> {
    const count = await prisma.user.count({ where: { email } });
    return count > 0;
  },
};
