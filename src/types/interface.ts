import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthRegisterUserProps {
  name: string;
  email: string;
  password: string;
  balance?: number;
  role: Role;
}

export interface AuthLoginUserProps {
  email: string;
  password: string;
}

export interface SendEmailLoginProps {
  email: string;
  name: string;
}

export interface TransferProps {
  clientId: string;
  merchantId: string;
  amount: number;
}

export interface AuthRequest extends Request {
  user?: { userId: string; role: Role };
}
