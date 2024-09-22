import prisma from "../../prisma/prisma";
import PDFDocument from "pdfkit";
import streamBuffers from "stream-buffers";
import {
  FindAndValidateUserProps,
  LogTransactionProps,
  TransactionLogsProps,
} from "../types/interface";
import { CustomError } from "../utils/CustomError";
import { EmailService } from "./emailService";

class LogsService {
  private async genereateLogsPDF(
    logs: TransactionLogsProps[]
  ): Promise<Buffer> {
    const doc = new PDFDocument();

    const bufferStream = new streamBuffers.WritableStreamBuffer({
      initialSize: 100 * 1024,
      incrementAmount: 10 * 1024,
    });

    doc.pipe(bufferStream);
    doc
      .fontSize(16)
      .text(`Relatório de Logs de Transações`, { align: "center" });
    doc.moveDown();

    logs.forEach((log, index) => {
      doc
        .fontSize(12)
        .text(`Transação #${index + 1}`, { underline: true })
        .moveDown(0.5);
      doc.text(`ID Transação: ${log.transactionId}`);
      doc.text(`De: ${log.fromUserId}`);
      doc.text(`Para: ${log.toUserId}`);
      doc.text(`Valor: R$${log.amount}`);
      doc.text(`Status: ${log.status}`);
      doc.text(`Data: ${log.timestamp}`);
      doc.moveDown();
    });
    doc.end();

    return new Promise<Buffer>((resolve, reject) => {
      bufferStream.on("finish", () => {
        resolve(bufferStream.getContents() as Buffer);
      });
      bufferStream.on("error", reject);
    });
  }

  private async findAndValidateUser({
    userId,
    expectedRole,
  }: FindAndValidateUserProps) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new CustomError("Usuário não encontrado", 404);
    }

    if (user.role !== expectedRole) {
      throw new CustomError("Usuário não autorizado", 403);
    }

    return user;
  }

  public async getAllTransactionLogs({
    userId,
    page,
    limit,
  }: LogTransactionProps) {
    const client = await this.findAndValidateUser({
      userId,
      expectedRole: "ADMIN",
    });

    if (page < 1 || limit < 1) {
      throw new CustomError(`Página e limite devem ser maiores que 0`, 400);
    }

    const skip = (page - 1) * limit;

    const logs = await prisma.transactionLog.findMany({
      skip,
      take: limit,
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!logs.length) {
      throw new CustomError("Nenhum log encontrado", 404);
    }

    const totalLogs = await prisma.transactionLog.count();
    const totalPages = Math.ceil(totalLogs / limit);

    const pdfBuffer = await this.genereateLogsPDF(logs);

    await EmailService.sendEmail({
      email: client.email,
      subject: "Relatório de Logs de Transações",
      text: "Relatório de Logs de Transações em anexo",
      attachment: {
        filename: "logs.pdf",
        content: pdfBuffer,
        contentType: "application/pdf",
      },
    });

    return {
      logs,
      currentPage: page,
      totalPages,
      totalLogs,
    };
  }
}

export default new LogsService();
