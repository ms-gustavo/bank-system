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
import { errorsMessagesAndCodes } from "../utils/errorsMessagesAndCodes";
import { Role } from "@prisma/client";
import { logsEmailNotification } from "../utils/emailServiceMessages";

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
      throw new CustomError(
        errorsMessagesAndCodes.userNotFound.message,
        errorsMessagesAndCodes.userNotFound.code
      );
    }

    if (expectedRole && user.role !== expectedRole) {
      throw new CustomError(
        errorsMessagesAndCodes.userNotAuthorized.message,
        errorsMessagesAndCodes.userNotAuthorized.code
      );
    }

    return user;
  }

  private async checkPageAndLimit(page: number, limit: number) {
    if (page < 1 || limit < 1) {
      throw new CustomError(
        errorsMessagesAndCodes.pageOrLimitInvalid.message,
        errorsMessagesAndCodes.pageOrLimitInvalid.code
      );
    }

    const firstPage = 1;
    const skip = (page - firstPage) * limit;
    return skip;
  }

  public async getAllTransactionLogs({
    userId,
    page,
    limit,
  }: LogTransactionProps) {
    const client = await this.findAndValidateUser({
      userId,
      expectedRole: Role.ADMIN,
    });

    const skip = await this.checkPageAndLimit(page, limit);

    const logs = await prisma.transactionLog.findMany({
      skip,
      take: limit,
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!logs.length) {
      throw new CustomError(
        errorsMessagesAndCodes.logsNotFound.message,
        errorsMessagesAndCodes.logsNotFound.code
      );
    }

    const totalLogs = await prisma.transactionLog.count();
    const totalPages = Math.ceil(totalLogs / limit);

    const pdfBuffer = await this.genereateLogsPDF(logs);

    const emailContent = logsEmailNotification({
      attachment: { content: pdfBuffer },
    });

    emailContent &&
      (await EmailService.sendEmail({
        email: client.email,
        subject: emailContent.subject,
        text: emailContent.text,
        attachment: {
          filename: emailContent.attachment.filename,
          content: emailContent.attachment.content,
          contentType: emailContent.attachment.contentType,
        },
      }));

    return {
      logs,
      currentPage: page,
      totalPages,
      totalLogs,
    };
  }

  public async getTransactionLogsByUserId({
    userId,
    page,
    limit,
  }: LogTransactionProps) {
    await this.findAndValidateUser({
      userId,
    });

    const skip = await this.checkPageAndLimit(page, limit);

    const logs = await prisma.transactionLog.findMany({
      where: {
        OR: [
          {
            fromUserId: userId,
          },
          {
            toUserId: userId,
          },
        ],
      },
      skip,
      take: limit,
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!logs.length) {
      throw new CustomError(
        errorsMessagesAndCodes.logsNotFound.message,
        errorsMessagesAndCodes.logsNotFound.code
      );
    }

    const totalLogs = await prisma.transactionLog.count({
      where: {
        OR: [
          {
            fromUserId: userId,
          },
          {
            toUserId: userId,
          },
        ],
      },
    });

    const totalPages = Math.ceil(totalLogs / limit);

    const logsAsSender = logs.filter((log) => log.fromUserId === userId);
    const logsAsRecipient = logs.filter((log) => log.toUserId === userId);
    return {
      logs: {
        asSender: logsAsSender,
        asRecipient: logsAsRecipient,
      },
      currentPage: page,
      totalPages,
      totalLogs,
    };
  }
}

export default new LogsService();
