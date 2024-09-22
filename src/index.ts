import express from "express";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import transferRoutes from "./routes/transferRoutes";
import logsRoutes from "./routes/logsRoutes";
dotenv.config();

const app = express();

app.use(express.json());
app.use("/logs", logsRoutes);
app.use("/auth", authRoutes);
app.use("/transfer", transferRoutes);
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
