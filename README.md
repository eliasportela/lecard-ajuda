# Lecard Ajuda

Base de conhecimento full-stack em Nuxt, com SSR, MySQL, Markdown e uploads no DigitalOcean Spaces.

## Desenvolvimento

1. Use Node.js 22 e crie um banco MySQL.
2. Copie `.env.example` para `.env` e preencha as variáveis.
3. Instale as dependências com `npm install`.
4. Execute `npm run db:migrate`.
5. Configure `ADMIN_EMAIL`, `ADMIN_PASSWORD` e rode `npm run db:seed`.
6. Inicie com `npm run dev`.

## Produção

O arquivo `.do/app.yaml` documenta a configuração do App Platform. Antes de usar, substitua o repositório e associe os segredos do MySQL e do Spaces.

O filesystem do App Platform é efêmero. Todos os uploads devem usar o endpoint de URL assinada do Spaces.

As imagens do editor são recebidas pela API da aplicação e enviadas ao Spaces pelo servidor, sem exigir configuração CORS no bucket. O MySQL armazena somente os metadados na tabela `attachments` e a URL no Markdown.

O login possui rate limiting em memória por IP e por combinação de IP/e-mail. Esse estado é local ao processo e é reiniciado a cada deploy; antes de executar mais de uma instância da aplicação, substitua o armazenamento do limitador por um serviço compartilhado, como Redis.

## Recuperação de senha

Configure `NUXT_BREVO_API_KEY`. Os e-mails são enviados por `LeCard <noreply@lecard.app>`, que precisa estar autorizado no Brevo. Execute `npm run db:migrate` para criar a tabela de tokens de recuperação.
