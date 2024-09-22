import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { AuthLoginUserProps, AuthRegisterUserProps } from "../types/interface";
import { CustomError } from "../utils/CustomError";
import { EmailService } from "./emailService";
import prisma from "../../prisma/prisma";
dotenv.config();

export class AuthService {
  static async registerUser({
    name,
    email,
    password,
    role,
    balance,
  }: AuthRegisterUserProps) {
    const emailToLowerCase = email.toLowerCase();
    const existingUser = await prisma.user.findUnique({
      where: { email: emailToLowerCase },
    });

    if (existingUser) {
      throw new CustomError(`Email já cadastrado`, 400);
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const confirmId = uuidv4();
    await prisma.userTemp.create({
      data: {
        name,
        email: emailToLowerCase,
        password: hashedPassword,
        role,
        balance,
        confirmId,
      },
    });

    const confirmationLink = `${process.env
      .BACKEND_URL!}/auth/confirm-registration/${confirmId}`;

    await EmailService.sendEmail({
      email: emailToLowerCase,
      subject: "Confirme seu cadastro",
      text: `Olá ${name},\n\nClique no link para confirmar seu cadastro: ${confirmationLink}\n\nObrigado!`,
    });

    return { message: `Cheque seu email para confirmar o cadastro` };
  }

  static async confirmRegistration(confirmId: string) {
    const tempUser = await prisma.userTemp.findUnique({
      where: { confirmId },
    });

    if (!tempUser) {
      throw new CustomError(`Usuário não encontrado`, 400);
    }

    const newUser = await prisma.user.create({
      data: {
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        role: tempUser.role,
        balance: tempUser.balance,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
        loginConfirmId: true,
      },
    });

    await prisma.userTemp.delete({
      where: { confirmId },
    });
  }

  static async confirmLoginUser(loginConfirmId: string) {
    const user = await prisma.user.findUnique({
      where: { loginConfirmId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        balance: true,
      },
    });

    if (!user) {
      throw new CustomError(`Usuário não encontrado`, 400);
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { loginConfirmId: null },
    });

    await EmailService.sendEmail({
      email: user.email,
      subject: "Notificação de Login",
      text: `Olá ${
        user.name
      },\n\nUm login foi realizado na sua conta em ${new Date().toLocaleString()}.\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
    });

    return { user, token };
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

    const loginConfirmId = uuidv4();

    await prisma.user.update({
      where: { id: user.id },
      data: { loginConfirmId },
    });

    const confirmationLink = `${process.env.BACKEND_URL}/auth/confirm-login/${loginConfirmId}`;

    await EmailService.sendEmail({
      email: user.email,
      subject: "Tentativa de Login",
      text: `Olá ${
        user.name
      },\n\nUma tentativa de login foi realizada na sua conta em ${new Date().toLocaleString()}.\n\nClique aqui para confirmar o login: ${confirmationLink}\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
    });
  }
}
