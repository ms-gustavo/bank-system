import { Response } from "express";
import { LogsDTO } from "../dtos/logsDTO";
import logsService from "../services/logsService";
import { AuthRequest } from "../types/interface";
import { CustomError } from "../utils/CustomError";
import { errorsMessagesAndCodes } from "../utils/errorsMessagesAndCodes";

class LogsController {
  public async getAllTransactionLogs(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user!.userId.toString();

      const { logs, currentPage, totalPages, totalLogs } =
        await logsService.getAllTransactionLogs({
          userId,
          page: Number(page),
          limit: Number(limit),
        });

      return res.status(200).json({ logs, currentPage, totalPages, totalLogs });
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

  public async getTransactionLogsById(
    req: AuthRequest,
    res: Response
  ): Promise<Response> {
    try {
      const { page = 1, limit = 10 } = req.query;
      const userId = req.user!.userId.toString();

      const { logs, currentPage, totalLogs, totalPages } =
        await logsService.getTransactionLogsByUserId({
          userId,
          page: Number(page),
          limit: Number(limit),
        });
      return res.status(200).json({ logs, currentPage, totalLogs, totalPages });
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

export default new LogsController();
