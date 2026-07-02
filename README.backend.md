# Distribuidora18 - Backend

Este PR adiciona um backend mínimo (Node/Express + SQLite) com suporte a registro/login, esqueci a senha (token por e-mail) e endpoints públicos para listar/adição de distribuidoras.

Passos para rodar localmente:

1. Criar .env seguindo .env.example
2. No diretório /server: npm install express better-sqlite3 bcrypt nodemailer dotenv cors body-parser
3. Rodar: node server/index.js
4. Ajustar VITE_API_URL no frontend (.env) para apontar para http://localhost:4000

Variáveis importantes:
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
- FROM_EMAIL
- FRONTEND_BASE_URL (URL onde o frontend é servido para montar o link de reset)

