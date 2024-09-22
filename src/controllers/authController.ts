import { Request, Response } from "express";
import { RegisterUserDTO } from "../dtos/registerUserDTO";
import { AuthService } from "../services/authService";
import { CustomError } from "../utils/CustomError";
import { LoginUserDTO } from "../dtos/loginUserDTO";

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role, balance }: RegisterUserDTO =
        req.body;

      const { message } = await AuthService.registerUser({
        name,
        email,
        password,
        role,
        balance,
      });
      return res.status(200).json({
        message,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res.status(500).json({ message: `Erro interno no servidor` });
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
        .status(200)
        .json({ message: `Cadastro confirmado com sucesso!` });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res.status(500).json({ message: `Erro interno no servidor` });
    }
  }

  static async confirmLogin(req: Request, res: Response): Promise<Response> {
    const { loginConfirmId } = req.params;

    try {
      const { user, token } = await AuthService.confirmLoginUser(
        loginConfirmId
      );
      return res.status(200).json({
        user,
        token,
        message: `Usuário logado com sucesso!`,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res.status(500).json({ message: `Erro interno no servidor` });
    }
  }

  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password }: LoginUserDTO = req.body;
      await AuthService.loginUser({ email, password });
      return res.status(200).json({
        message: `Por favor, cheque o token enviado para o seu email`,
      });
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ message: error.message });
      }
      console.error((error as Error).message);
      return res.status(500).json({ message: `Erro interno no servidor` });
    }
  }
}
