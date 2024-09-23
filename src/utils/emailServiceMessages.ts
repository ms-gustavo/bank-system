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

export const AuthRegisterEmailNotification = ({
  name,
  newConfirmationLink,
}: EmailServiceMessagesProps) => {
  return {
    subject: "Confirmação de Cadastro",
    text: `Olá ${name},\n\nClique no link para confirmar seu cadastro: ${newConfirmationLink}\n\nObrigado!`,
  };
};

export const AuthLoginEmailNotification = ({
  name,
}: EmailServiceMessagesProps) => {
  return {
    subject: "Notificação de Login",
    text: `Olá ${name},\n\nUm login foi realizado na sua conta em ${new Date().toLocaleString()}.\n\nSe não foi você, por favor, entre em contato com o suporte imediatamente.\n\nObrigado!`,
  };
};
