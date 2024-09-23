export const errorsMessagesAndCodes = {
  emailAlreadyRegistered: {
    message: "Email já cadastrado",
    code: 400,
  },
  userNotFound: {
    message: "Usuário não encontrado",
    code: 404,
  },
  userNotAuthorized: {
    message: "Usuário não autorizado",
    code: 403,
  },
  insufficientBalance: {
    message: "Saldo insuficiente",
    code: 400,
  },
  transactionSuccess: {
    message: "Transação realizada com sucesso",
    code: 200,
  },
  invalidCredentials: {
    message: "Email ou senha incorretos",
    code: 400,
  },
  emailNotSent: {
    message: "Erro ao enviar email",
    code: 500,
  },
  pageOrLimitInvalid: {
    message: "Página e limite devem ser maiores que 0",
    code: 400,
  },
  logsNotFound: {
    message: "Nenhum log encontrado",
    code: 404,
  },
};
