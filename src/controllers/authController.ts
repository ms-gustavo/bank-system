import { Request, Response } from "express";
import { RegisterUserDTO } from "../dtos/registerUserDTO";
import { AuthService } from "../services/authService";
import { CustomError } from "../utils/CustomError";
import { LoginUserDTO } from "../dtos/loginUserDTO";
import { errorsMessagesAndCodes } from "../utils/errorsMessagesAndCodes";
import { successMessagesAndCodes } from "../utils/successMessagesAndCodes";

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role, balance }: RegisterUserDTO =
        req.body;

      const result = await AuthService.registerUser({
        name,
        email,
        password,
        role,
        balance,
      });

      if (!result) {
        throw new CustomError(
          errorsMessagesAndCodes.registerFailed.message,
          errorsMessagesAndCodes.registerFailed.code
        );
      }

      const { message } = result;
      return res.status(200).json({
        message,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res
        .status(errorsMessagesAndCodes.internalServerError.code)
        .json({ message: errorsMessagesAndCodes.internalServerError.message });
    }
  }

  static async confirmRegistration(
    req: Request,
    res: Response
  ): Promise<Response> {
    const { confirmId } = req.params;

    try {
      await AuthService.confirmRegistration(confirmId);
      return res
        .status(successMessagesAndCodes.successRegister.code)
        .json({ message: successMessagesAndCodes.successRegister.message });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res
        .status(errorsMessagesAndCodes.internalServerError.code)
        .json({ message: errorsMessagesAndCodes.internalServerError.message });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: LoginUserDTO = req.body;
      const result = await AuthService.loginUser({ email, password });
      if (!result) {
        throw new CustomError(
          errorsMessagesAndCodes.loginFailed.message,
          errorsMessagesAndCodes.loginFailed.code
        );
      }
      const { user, token } = result;
      return res.status(successMessagesAndCodes.successLogin.code).json({
        user,
        token,
        message: successMessagesAndCodes.successLogin.message,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res
        .status(errorsMessagesAndCodes.internalServerError.code)
        .json({ message: errorsMessagesAndCodes.internalServerError.message });
    }
  }
}
