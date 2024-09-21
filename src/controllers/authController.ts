import { Request, Response } from "express";
import { RegisterUserDTO } from "../dtos/registerUserDTO";
import { AuthService } from "../services/authService";
import { CustomError } from "../utils/CustomError";
import { LoginUserDTO } from "../dtos/loginUserDTO";

export class AuthController {
  static async register(req: Request, res: Response): Promise<Response> {
    try {
      const { name, email, password, role }: RegisterUserDTO = req.body;

      const { newUser, token } = await AuthService.registerUser({
        name,
        email,
        password,
        role,
      });
      return res.status(201).json({
        newUser,
        token,
        message: `Usuário criado com sucesso!`,
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
      const token = await AuthService.loginUser({ email, password });
      return res.status(200).json({
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
}
