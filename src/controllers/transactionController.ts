import { Request, Response } from "express";
import { AuthRequest } from "../types/interface";
import {
  ClientToMerchantTransactionDTO,
  MerchantToSupplierTransactionDTO,
} from "../dtos/transactionDTO";
import transactionService from "../services/transactionService";
import { CustomError } from "../utils/CustomError";

class TransactionController {
  public async clientTransfer(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const { merchantId, amount, password }: ClientToMerchantTransactionDTO =
      req.body;
    const clientId = req.user!.userId.toString();
    try {
      const transaction = await transactionService.clientToMerchant({
        clientId,
        merchantId,
        amount,
        password,
      });
      return res.status(200).json({
        transaction,
        message: `Transação realizada com sucesso`,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.log((error as Error).message);
      return res.status(500).json({ message: `Erro interno do servidor` });
    }
  }

  public async merchantTransfer(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const { supplierId, amount, password }: MerchantToSupplierTransactionDTO =
      req.body;
    const merchantId = req.user!.userId.toString();
    try {
      const transaction = await transactionService.merchantToSupplier({
        merchantId,
        supplierId,
        amount,
        password,
      });
      return res.status(200).json({
        transaction,
        message: `Transação realizada com sucesso`,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.log((error as Error).message);
      return res.status(500).json({ message: `Erro interno do servidor` });
    }
  }
}

export default new TransactionController();
