import { Request, Response } from "express";
import { AuthRequest } from "../types/interface";
import { TransactionDTO } from "../dtos/transactionDTO";
import transactionService from "../services/transactionService";
import { CustomError } from "../utils/CustomError";

class TransactionController {
  public async clientTransfer(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    const { merchantId, amount }: TransactionDTO = req.body;
    const clientId = req.user!.userId.toString();

    try {
      const transaction = await transactionService.transfer({
        clientId,
        merchantId,
        amount,
      });
      return res.status(200).json({
        transaction,
        message: `Transação realizada com sucesso`,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: `Erro interno do servidor` });
    }
  }
}

export default new TransactionController();
