import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { AuthLoginUserProps, AuthRegisterUserProps } from "../types/interface";
import { CustomError } from "../utils/CustomError";
import { EmailService } from "./emailService";
import prisma from "../../prisma/prisma";
import { errorsMessagesAndCodes } from "../utils/errorsMessagesAndCodes";
import {
  AuthLoginEmailNotification,
  AuthRegisterEmailNotification,
} from "../utils/emailServiceMessages";
dotenv.config();

export class AuthService {
  private static async sendEmail({
    name,
    confirmId,
    emailToLowerCase,
  }: {
    name: string;
    confirmId: string;
    emailToLowerCase: string;
  }) {
    const newConfirmationLink = `${process.env
      .BACKEND_URL!}/auth/confirm-registration/${confirmId}`;

    const emailContent = AuthRegisterEmailNotification({
      name,
      newConfirmationLink,
    });

    await EmailService.sendEmail({
      email: emailToLowerCase,
      subject: emailContent.subject,
      text: emailContent.text,
    });
  }

  private static async sendConfirmationRegisterEmailIfExistingTempUser(
    name: string,
    emailToLowerCase: string
  ) {
    const newConfirmId = uuidv4();
    await prisma.userTemp.update({
      where: { email: emailToLowerCase },
      data: { confirmId: newConfirmId },
    });

    await this.sendEmail({
      name,
      confirmId: newConfirmId,
      emailToLowerCase,
    });

    return { message: `Cheque seu email para confirmar o cadastro` };
  }

  private static async checkLoginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (!user) {
      throw new CustomError(
        errorsMessagesAndCodes.invalidCredentials.message,
        errorsMessagesAndCodes.invalidCredentials.code
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new CustomError(
        errorsMessagesAndCodes.invalidCredentials.message,
        errorsMessagesAndCodes.invalidCredentials.code
      );
    }

    return user;
  }

  static async registerUser({
    name,
    email,
    password,
    role,
    balance,
  }: AuthRegisterUserProps) {
    try {
      const emailToLowerCase = email.toLowerCase();
      const existingUser = await prisma.user.findUnique({
        where: { email: emailToLowerCase },
      });

      if (existingUser) {
        throw new CustomError(
          errorsMessagesAndCodes.emailAlreadyRegistered.message,
          errorsMessagesAndCodes.emailAlreadyRegistered.code
        );
      }

      const existingTempUser = await prisma.userTemp.findUnique({
        where: { email: emailToLowerCase },
      });

      if (existingTempUser) {
        await this.sendConfirmationRegisterEmailIfExistingTempUser(
          name,
          emailToLowerCase
        );
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

      await this.sendEmail({
        name,
        confirmId,
        emailToLowerCase,
      });

      return { message: `Cheque seu email para confirmar o cadastro` };
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error((error as Error).message);
    }
  }

  static async confirmRegistration(confirmId: string) {
    try {
      const tempUser = await prisma.userTemp.findFirst({
        where: { confirmId },
      });
      if (!tempUser) {
        throw new CustomError(
          errorsMessagesAndCodes.userNotFound.message,
          errorsMessagesAndCodes.userNotFound.code
        );
      }

      await prisma.user.create({
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
        },
      });
      await prisma.userTemp.delete({
        where: { confirmId },
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error((error as Error).message);
    }
  }

  static async loginUser({ email, password }: AuthLoginUserProps) {
    try {
      const emailToLowerCase = email.toLowerCase();
      const user = await this.checkLoginUser(emailToLowerCase, password);

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: "1h" }
      );

      const emailContent = AuthLoginEmailNotification({
        name: user.name,
      });

      await EmailService.sendEmail({
        email: user.email,
        subject: emailContent.subject,
        text: emailContent.text,
      });

      return { user, token };
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        throw error;
      }
      console.error((error as Error).message);
    }
  }
}
