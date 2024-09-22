import { Router } from "express";
import { AuthMiddleware } from "../middlewares/auth.middleware";
import { RoleMiddleware } from "../middlewares/role.middleware";
import transactionController from "../controllers/transactionController";
import {
  ClientToMerchantTransactionDTO,
  MerchantToSupplierTransactionDTO,
} from "../dtos/transactionDTO";
import { validateDTO } from "../middlewares/validate.middleware";

const router = Router();

router.post(
  "/client",
  AuthMiddleware.authenticateToken,
  RoleMiddleware.authorizeRoles("CLIENT"),
  validateDTO(ClientToMerchantTransactionDTO),
  transactionController.clientTransfer
);

router.post(
  "/merchant",
  AuthMiddleware.authenticateToken,
  RoleMiddleware.authorizeRoles("MERCHANT"),
  validateDTO(MerchantToSupplierTransactionDTO),
  transactionController.merchantTransfer
);

export default router;
