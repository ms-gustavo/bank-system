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
import { errorsMessagesAndCodes } from "../utils/errorsMessagesAndCodes";
import { transactionEmailNotification } from "../utils/emailServiceMessages";
import { Role } from "@prisma/client";

class TransactionService {
  private async checkPassword({ userId, password }: CheckPasswordProps) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError(
        errorsMessagesAndCodes.userNotFound.message,
        errorsMessagesAndCodes.userNotFound.code
      );
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new CustomError(
        errorsMessagesAndCodes.invalidCredentials.message,
        errorsMessagesAndCodes.invalidCredentials.code
      );
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
      throw new CustomError(
        errorsMessagesAndCodes.userNotFound.message,
        errorsMessagesAndCodes.userNotFound.code
      );
    }

    if (user.role !== expectedRole) {
      throw new CustomError(
        errorsMessagesAndCodes.userNotAuthorized.message,
        errorsMessagesAndCodes.userNotAuthorized.code
      );
    }

    return user;
  }

  private validateSufficientBalance({
    user: { balance },
    amount,
  }: ValidateSufficientBalanceProps) {
    if (balance < amount) {
      throw new CustomError(
        errorsMessagesAndCodes.insufficientBalance.message,
        errorsMessagesAndCodes.insufficientBalance.code
      );
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
      await this.checkPassword({
        userId: clientId,
        password,
      });
      const client = await this.findAndValidateUser({
        userId: clientId,
        expectedRole: Role.CLIENT,
      });

      this.validateSufficientBalance({
        user: client,
        amount,
      });

      const merchant = await this.findAndValidateUser({
        userId: merchantId,
        expectedRole: Role.MERCHANT,
      });

      const transaction = await this.performTransaction({
        fromUserId: clientId,
        toUserId: merchantId,
        amount,
      });

      const emailContent = transactionEmailNotification({
        fromUser: client.name,
        amount,
        toUser: merchant.name,
      });

      await EmailService.sendEmail({
        email: client.email,
        subject: emailContent.subject,
        text: emailContent.text,
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
      await this.checkPassword({
        userId: merchantId,
        password,
      });

      const merchant = await this.findAndValidateUser({
        userId: merchantId,
        expectedRole: Role.MERCHANT,
      });

      this.validateSufficientBalance({
        user: merchant,
        amount,
      });

      const supplier = await this.findAndValidateUser({
        userId: supplierId,
        expectedRole: Role.SUPPLIER,
      });

      const transaction = await this.performTransaction({
        fromUserId: merchantId,
        toUserId: supplierId,
        amount,
      });

      const emailContent = transactionEmailNotification({
        fromUser: merchant.name,
        amount,
        toUser: supplier.name,
      });

      await EmailService.sendEmail({
        email: merchant.email,
        subject: emailContent.subject,
        text: emailContent.text,
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
