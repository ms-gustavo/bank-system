import { NextFunction, Request, Response } from "express";
import { Role } from "../types/interface";
import { CustomError } from "../utils/CustomError";

export class RoleMiddleware {
  static authorizeRoles(...allowedRoles: Role[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const user = (req as any).user;

      if (!user) {
        throw new CustomError(`Usuário não autenticado`, 401);
      }

      if (!allowedRoles.includes(user.role)) {
        throw new CustomError(
          `Usuário não tem permissão para acessar esse recurso`,
          403
        );
      }

      next();
    };
  }
}
