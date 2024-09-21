import { NextFunction, Request, Response } from "express";
import { plainToInstance } from "class-transformer";
import { validate, ValidationError } from "class-validator";

export function validateDTO(dtoClass: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dtoInstance = plainToInstance(dtoClass, req.body);

    const errors: ValidationError[] = await validate(dtoInstance);
    if (errors.length > 0) {
      return res.status(400).json({
        message: "Erro de validação",
        errors: errors.map((error) => ({
          field: error.property,
          errors: Object.values(error.constraints || {}),
        })),
      });
    }
    next();
  };
}
