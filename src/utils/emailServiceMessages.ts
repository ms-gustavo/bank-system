interface EmailServiceMessagesProps {
  fromUser: string;
  amount: number;
  toUser: string;
}

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
