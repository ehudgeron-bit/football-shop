import bcrypt from "bcryptjs";
import { userRepository } from "@/repositories/user.repository";
import type { RegisterInput } from "@/lib/validators/auth";

const SALT_ROUNDS = 12;

export const authService = {
  async register(input: RegisterInput) {
    const emailExists = await userRepository.exists(input.email);
    if (emailExists) {
      throw new Error("כתובת המייל כבר רשומה במערכת");
    }

    const hashedPassword = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await userRepository.create({
      email: input.email,
      hashedPassword,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
    });

    // Never return the hashed password to callers
    const { hashedPassword: _, ...safeUser } = user;
    return safeUser;
  },
};
