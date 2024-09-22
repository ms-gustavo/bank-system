import nodemailer from "nodemailer";
import {
  SendConfirmationRegisterEmailProps,
  SendEmailLoginProps,
} from "../types/interface";
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
  static async sendEmail({ email, subject, text }: SendEmailLoginProps) {
    const mailOptions = {
      from: emailUser,
      to: email,
      subject,
      text,
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
