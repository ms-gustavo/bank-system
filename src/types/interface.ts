import { Role } from "@prisma/client";
import { Request } from "express";

export interface AuthRegisterUserProps {
  name: string;
  email: string;
  password: string;
  balance?: number;
  role: Role;
}

export interface LogTransactionProps {
  userId: string;
  page: number;
  limit: number;
}

export interface LogFailedTransactionProps {
  fromUserId: string;
  toUserId: string;
  amount: number;
  error: unknown;
}

export interface PerformTransactionProps {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface ValidateSufficientBalanceProps {
  user: { balance: number };
  amount: number;
}

export interface TransactionLogsProps {
  id: string;
  transactionId: string | null;
  fromUserId: string;
  toUserId: string;
  amount: number;
  timestamp: Date;
  status: string;
  errorMessage: string | null;
}

export interface FindAndValidateUserProps {
  userId: string;
  expectedRole?: Role;
}

export interface AuthLoginUserProps {
  email: string;
  password: string;
}

export interface SendConfirmationRegisterEmailProps {
  email: string;
  subject: string;
  text: string;
}

export interface SendEmailLoginProps {
  email: string;
  subject: string;
  text: string;
  attachment?: {
    filename: string;
    content: any;
    contentType: string;
  };
}

export interface ClientToMerchantTransferProps {
  clientId: string;
  merchantId: string;
  amount: number;
  password: string;
}

export interface CheckPasswordProps {
  password: string;
  userId: string;
}

export interface MerchantToSupplierProps {
  merchantId: string;
  supplierId: string;
  amount: number;
  password: string;
}

export interface AuthRequest extends Request {
  user?: { userId: string; role: Role };
}
