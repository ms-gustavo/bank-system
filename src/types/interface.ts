import { Role } from "@prisma/client";

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
