import prisma from "../../prisma/prisma";
import bcrypt from "bcryptjs";
import {
  CheckPasswordProps,
  ClientToMerchantTransferProps,
  FindAndValidateUserProps,
  LogFailedTransactionProps,
  MerchantToSupplierProps,
  PerformTransactionProps,
  ValidateSufficientBalanceProps,
} from "../types/interface";
import { CustomError } from "../utils/CustomError";
import { EmailService } from "./emailService";

class TransactionService {
  private async checkPassword({ userId, password }: CheckPasswordProps) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError("Usuário não encontrado", 404);
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new CustomError(`Email ou senha incorretos`, 400);
    }
  }

  private async findAndValidateUser({
    userId,
    expectedRole,
  }: FindAndValidateUserProps) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError("Usuário não encontrado", 404);
    }

    if (user.role !== expectedRole) {
      throw new CustomError("Usuário não autorizado", 403);
    }

    return user;
  }

  private validateSufficientBalance({
    user: { balance },
    amount,
  }: ValidateSufficientBalanceProps) {
    if (balance < amount) {
      throw new CustomError(`Saldo insuficiente`, 400);
    }
  }

  private async performTransaction({
    fromUserId,
    toUserId,
    amount,
  }: PerformTransactionProps) {
    const transaction = await prisma.$transaction(async (tx) => {
      const decreaseFromUser = await tx.user.update({
        where: { id: fromUserId },
        data: { balance: { decrement: amount } },
      });

      const increateToUser = await tx.user.update({
        where: { id: toUserId },
        data: { balance: { increment: amount } },
      });

      const newTransaction = await tx.transaction.create({
        data: {
          fromUserId,
          toUserId,
          amount,
        },
      });

      await tx.transactionLog.create({
        data: {
          transactionId: newTransaction.id,
          fromUserId: decreaseFromUser.id,
          toUserId: increateToUser.id,
          amount,
          status: "success",
        },
      });

      return newTransaction;
    });

    return transaction;
  }

  private async logFailedTransaction({
    fromUserId,
    toUserId,
    amount,
    error,
  }: LogFailedTransactionProps) {
    await prisma.transactionLog.create({
      data: {
        transactionId: null,
        fromUserId,
        toUserId,
        amount,
        status: "failed",
        errorMessage: (error as Error).message,
      },
    });
  }

  public async clientToMerchant({
    clientId,
    merchantId,
    amount,
    password,
  }: ClientToMerchantTransferProps) {
    try {
      const checkPassword = await this.checkPassword({
        userId: clientId,
        password,
      });
      const client = await this.findAndValidateUser({
        userId: clientId,
        expectedRole: "CLIENT",
      });

      this.validateSufficientBalance({
        user: client,
        amount,
      });

      const merchant = await this.findAndValidateUser({
        userId: merchantId,
        expectedRole: "MERCHANT",
      });

      const transaction = await this.performTransaction({
        fromUserId: clientId,
        toUserId: merchantId,
        amount,
      });

      await EmailService.sendEmail({
        email: client.email,
        subject: "Notificação de Transação",
        text: `Olá ${
          client.name
        },\n\nUma transação de R$${amount} foi realizada em ${new Date().toLocaleString()} para ${
          merchant.name
        }.\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
      });

      return transaction;
    } catch (error: unknown) {
      await this.logFailedTransaction({
        fromUserId: clientId,
        toUserId: merchantId,
        amount,
        error,
      });

      throw error;
    }
  }

  public async merchantToSupplier({
    merchantId,
    supplierId,
    amount,
    password,
  }: MerchantToSupplierProps) {
    try {
      const checkPassword = await this.checkPassword({
        userId: merchantId,
        password,
      });

      const merchant = await this.findAndValidateUser({
        userId: merchantId,
        expectedRole: "MERCHANT",
      });

      this.validateSufficientBalance({
        user: merchant,
        amount,
      });

      const supplier = await this.findAndValidateUser({
        userId: supplierId,
        expectedRole: "SUPPLIER",
      });

      const transaction = await this.performTransaction({
        fromUserId: merchantId,
        toUserId: supplierId,
        amount,
      });

      await EmailService.sendEmail({
        email: merchant.email,
        subject: "Notificação de Transação",
        text: `Olá ${
          merchant.name
        },\n\nUma transação de ${amount} foi realizada em ${new Date().toLocaleString()} para ${
          supplier.name
        }.\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
      });

      return transaction;
    } catch (error: unknown) {
      await this.logFailedTransaction({
        fromUserId: merchantId,
        toUserId: supplierId,
        amount,
        error,
      });

      throw error;
    }
  }
}

export default new TransactionService();
