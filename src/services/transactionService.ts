import prisma from "../../prisma/prisma";
import { TransferProps } from "../types/interface";
import { CustomError } from "../utils/CustomError";

class TransactionService {
  public async transfer({ clientId, merchantId, amount }: TransferProps) {
    try {
      const client = await prisma.user.findUnique({
        where: { id: clientId },
      });

      if (!client || client.role !== "CLIENT") {
        throw new CustomError("Cliente não encontrado", 404);
      }

      if (client.balance < amount) {
        throw new CustomError("Saldo insuficiente", 400);
      }

      const merchant = await prisma.user.findUnique({
        where: { id: merchantId },
      });

      if (!merchant || merchant.role !== "MERCHANT") {
        throw new CustomError("Estabelecimento não encontrado", 404);
      }

      const transaction = await prisma.$transaction(async (tx) => {
        const updatedClient = await tx.user.update({
          where: { id: clientId },
          data: { balance: { decrement: amount } },
        });

        const updatedMerchant = await tx.user.update({
          where: { id: merchantId },
          data: { balance: { increment: amount } },
        });

        const newTransaction = await tx.transaction.create({
          data: {
            fromUserId: clientId,
            toUserId: merchantId,
            amount,
          },
        });

        const transactionLog = await tx.transactionLog.create({
          data: {
            transactionId: newTransaction.id,
            fromUserId: updatedClient.id,
            toUserId: updatedMerchant.id,
            amount,
            status: "success",
          },
        });

        return newTransaction;
      });

      return transaction;
    } catch (error: unknown) {
      await prisma.transactionLog.create({
        data: {
          transactionId: "N/A",
          fromUserId: clientId,
          toUserId: merchantId,
          amount,
          status: "failure",
          errorMessage: (error as Error).message,
        },
      });
      throw error;
    }
  }
}

export default new TransactionService();
