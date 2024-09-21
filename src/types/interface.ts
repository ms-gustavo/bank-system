export interface AuthRegisterUserProps {
  name: string;
  email: string;
  password: string;
  role: Role;
}
export enum Role {
  CLIENT = "client",
  MERCHANT = "merchant",
  SUPPLIER = "supplier",
}

export interface AuthLoginUserProps {
  email: string;
  password: string;
}

export interface SendEmailLoginProps {
  email: string;
  name: string;
}
