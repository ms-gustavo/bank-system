import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CustomError } from "../utils/CustomError";

export class AuthMiddleware {
  static authenticateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        throw new CustomError(`Token não fornecido`, 401);
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        [key: string]: any;
      };
      (req as any).user = decoded;
      next();
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      return res.status(500).json({ message: "Erro interno do servidor" });
    }
  }
}
