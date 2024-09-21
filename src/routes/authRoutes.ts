import { Router } from "express";
import { AuthController } from "../controllers/authController";
import { validateDTO } from "../middlewares/validate.middleware";
import { RegisterUserDTO } from "../dtos/registerUserDTO";
import { LoginUserDTO } from "../dtos/loginUserDTO";

const router = Router();

router.post("/register", validateDTO(RegisterUserDTO), AuthController.register);
router.post("/login", validateDTO(LoginUserDTO), AuthController.login);

export default router;
