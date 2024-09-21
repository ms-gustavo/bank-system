import nodemailer from "nodemailer";
import { SendEmailLoginProps } from "../types/interface";
import dotenv from "dotenv";
dotenv.config();

const emailUser = process.env.EMAIL_USER!;
const emailPass = process.env.EMAIL_PASS!;
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: emailUser,
    pass: emailPass,
  },
});

export class EmailService {
  static async sendLoginEmail({ email, name }: SendEmailLoginProps) {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject: "Notificação de Login",
      text: `Olá ${name},\n\nUm login foi realizado na sua conta em ${new Date().toLocaleString()}.\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email enviado para ${email}`);
    } catch (error: unknown) {
      console.error(
        `Erro ao enviar email para ${email}: ${(error as Error).message}`
      );
    }
  }
}
