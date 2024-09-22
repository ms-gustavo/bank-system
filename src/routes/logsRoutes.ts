import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RoleMiddleware } from "../middlewares/role.middleware";
import logsController from "../controllers/logsController";

const router = Router();

router.get(
  "/all-logs",
  AuthMiddleware.authenticateToken,
  RoleMiddleware.authorizeRoles("ADMIN"),
  logsController.getAllTransactionLogs
);
router.get(
  "/logs/:userId",
  AuthMiddleware.authenticateToken,
  RoleMiddleware.authorizeRoles("CLIENT", "MERCHANT", "SUPPLIER", "ADMIN"),
  logsController.getTransactionLogsById
);

export default router;
