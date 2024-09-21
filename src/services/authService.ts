import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthLoginUserProps, AuthRegisterUserProps } from "../types/interface";
import { CustomError } from "../utils/CustomError";

const prisma = new PrismaClient();

export class AuthService {
  static async registerUser({
    name,
    email,
    password,
    role,
  }: AuthRegisterUserProps) {
    const emailToLowerCase = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailToLowerCase },
    });

    if (existingUser) {
      throw new CustomError(`Email já cadastrado`, 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email: emailToLowerCase,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
    const token = jwt.sign(
      { userId: newUser.id, role: newUser.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );
    return { newUser, token };
  }

  static async loginUser({ email, password }: AuthLoginUserProps) {
    const emailToLowerCase = email.toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: emailToLowerCase },
    });

    if (!user) {
      throw new CustomError(`Email ou senha incorretos`, 400);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new CustomError(`Email ou senha incorretos`, 400);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    return token;
  }
}
