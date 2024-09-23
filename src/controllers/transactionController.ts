import { Request, Response } from "express";
import { AuthRequest } from "../types/interface";
import {
  ClientToMerchantTransactionDTO,
  MerchantToSupplierTransactionDTO,
} from "../dtos/transactionDTO";
import transactionService from "../services/transactionService";
import { CustomError } from "../utils/CustomError";
import { errorsMessagesAndCodes } from "../utils/errorsMessagesAndCodes";
import { successMessagesAndCodes } from "../utils/successMessagesAndCodes";

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
      return res.status(successMessagesAndCodes.successTransaction.code).json({
        transaction,
        message: successMessagesAndCodes.successTransaction.message,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.log((error as Error).message);
      return res
        .status(errorsMessagesAndCodes.internalServerError.code)
        .json({ message: errorsMessagesAndCodes.internalServerError.message });
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
      return res.status(successMessagesAndCodes.successTransaction.code).json({
        transaction,
        message: successMessagesAndCodes.successTransaction.message,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.log((error as Error).message);
      return res
        .status(errorsMessagesAndCodes.internalServerError.code)
        .json({ message: errorsMessagesAndCodes.internalServerError.message });
    }
  }
}

export default new TransactionController();
