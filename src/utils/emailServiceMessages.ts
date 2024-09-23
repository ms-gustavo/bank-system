import { EmailServiceMessagesProps } from "../types/interface";

export const transactionEmailNotification = ({
  fromUser,
  amount,
  toUser,
}: EmailServiceMessagesProps) => {
  return {
    subject: "Notificação de Transação",
    text: `Olá ${fromUser},\n\nUma transação de R$${amount} foi realizada em ${new Date().toLocaleString()} para ${toUser}.\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
  };
};

export const logsEmailNotification = ({
  attachment,
}: EmailServiceMessagesProps) => {
  if (attachment && attachment.content) {
    const { content } = attachment;
    return {
      subject: "Relatório de Logs de Transações",
      text: "Relatório de Logs de Transações em anexo",
      attachment: {
        filename: "logs.pdf",
        content,
        contentType: "application/pdf",
      },
    };
  }
};
