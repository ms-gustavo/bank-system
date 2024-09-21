import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RoleMiddleware } from "../middlewares/role.middleware";
import transactionController from "../controllers/transactionController";

const router = Router();

router.post(
  "/client",
  AuthMiddleware.authenticateToken,
  RoleMiddleware.authorizeRoles("CLIENT"),
  transactionController.clientTransfer
);

export default router;
