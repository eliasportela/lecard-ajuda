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
