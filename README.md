  <h1>Sistema de Transação Bancária</h1>
  <p>Este é um sistema de transação bancária robusto, construído com foco em autenticação e segurança, permitindo transações entre <strong>Clientes</strong>, <strong>Lojistas</strong>, e <strong>Fornecedores</strong>.</p>

  <h2>📌 Funcionalidades Principais</h2>
  <ul>
    <li><strong>Autenticação JWT:</strong> Segurança no acesso com geração de tokens JWT.</li>
    <li><strong>Confirmação por Email:</strong> Confirmação de registro com UUID e notificação de login e transações via email.</li>
    <li><strong>Autorização por Papéis:</strong> Controle de acesso com quatro níveis de usuários: Admin, Cliente, Lojista, e Fornecedor.</li>
    <li><strong>Transações Financeiras:</strong> Clientes podem enviar valores a Lojistas, e Lojistas podem transacionar com Fornecedores.</li>
    <li><strong>Logs Detalhados:</strong> Registros detalhados de todas as transações, com logs de sucesso e falha, incluindo envio de logs por email.</li>
    <li><strong>Taxa de Requisição:</strong> Proteção contra ataques de força bruta usando limite de requisições.</li>
  </ul>

  <h2>🚀 Tecnologias Utilizadas</h2>
  <ul>
    <li>Node.js</li>
    <li>TypeScript</li>
    <li>Prisma ORM</li>
    <li>MongoDB</li>
    <li>Nodemailer</li>
    <li>JWT (JSON Web Tokens)</li>
    <li>Express</li>
    <li>Class-validator</li>
    <li>Rate Limiting com Express-rate-limit</li>
  </ul>

  <h2>⚙️ Configurações Iniciais</h2>
  <ol>
    <li>Clone o repositório:
      <pre><code>git clone https://github.com/ms-gustavo/bank-system.git</code></pre>
    </li>
    <li>Instale as dependências:
      <pre><code>npm install</code></pre>
    </li>
    <li>Configure as variáveis de ambiente no arquivo <code>.env</code>:
      <pre>
        <code>
        BACKEND_URL=""
        DATABASE_URL=mongodb://localhost:27017/sistema-bancario
        JWT_SECRET=sua_chave_secreta
        EMAIL_USER=seu_email@gmail.com
        EMAIL_PASS=sua_senha
        </code>
      </pre>
    </li>
    <li>Rode as migrações do Prisma:
      <pre><code>npx prisma migrate dev</code></pre>
    </li>
    <li>Inicie o servidor:
      <pre><code>npm run dev</code></pre>
    </li>
  </ol>

  <h2>🧑‍💻 Endpoints Principais</h2>
  <ul>
    <li><strong>POST /auth/register:</strong> Registrar um novo usuário (Cliente, Lojista, Fornecedor ou Admin) com confirmação por email.</li>
    <li><strong>POST /auth/login:</strong> Login com notificação via email.</li>
    <li><strong>POST /transfer/client:</strong> Realizar transação entre Cliente e Lojista com notificação via email.</li>
    <li><strong>POST /transfer/merchant:</strong> Realizar transação entre Lojista e Fornecedor com notificação via email.</li>
    <li><strong>GET /logs/:</strong> Obter logs de transações com paginação.</li>
  </ul>

  <h2>🔒 Segurança</h2>
  <p>Este sistema utiliza uma série de medidas de segurança, como autenticação baseada em tokens JWT, proteção contra ataques de força bruta com limitação de requisições e confirmação de registro via email.</p>

  <h3>Confirmação de Registro</h3>
  <p>Antes que um usuário seja registrado, é necessário que ele confirme sua identidade através de um link enviado por email. Isso garante uma camada extra de segurança e verificação.</p>

  <h2>📝 Estrutura de Pastas</h2>
  <pre>
    <code>
    /prisma 
    /src
    ├── /controllers
    ├── /dtos
    ├── /routes  
    ├── /middlewares
    ├── /services
    │   ├── authService.ts
    │   ├── logsService.ts
    │   ├── transactionService.ts
    │   └── emailService.ts
    ├── /types
    └── /utils
    </code>
  </pre>

  <h2>🛠 Melhorias Futuras</h2>
  <ul>
    <li>Documentação.</li>
    <li>Teste automatizados.</li>
  </ul>

  <h2>🤝 Contribuições</h2>
  <p>Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.</p>
