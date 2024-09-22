import { Response } from "express";
import { LogsDTO } from "../dtos/logsDTO";
import logsService from "../services/logsService";
import { AuthRequest } from "../types/interface";
import { CustomError } from "../utils/CustomError";

class LogsController {
  public async getAllTransactionLogs(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user!.userId.toString();

      const logs = await logsService.getAllTransactionLogs({
        userId,
        page: Number(page),
        limit: Number(limit),
      });

      return res.status(200).json(logs);
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.log((error as Error).message);
      return res.status(500).json({ message: `Erro interno do servidor` });
    }
  }
}

export default new LogsController();
