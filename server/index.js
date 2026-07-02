import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import crypto from 'crypto';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import Database from 'better-sqlite3';
import path from 'path';
dotenv.config();

const PORT = process.env.PORT || 4000;
const FRONTEND_BASE = process.env.FRONTEND_BASE_URL || 'http://localhost:5173';
const dbFile = process.env.DATABASE_FILE || './data/db.sqlite';
const db = new Database(dbFile);

// Init tables
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT DEFAULT 'user',
  reset_token TEXT,
  reset_expires INTEGER
);

CREATE TABLE IF NOT EXISTS distributors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  address TEXT,
  status TEXT DEFAULT 'active'
);
`);

// Simple transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Register
app.post('/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!email || !password) return res.status(400).json({ message: 'Email e senha obrigatórios' });
  const hash = await bcrypt.hash(password, 10);
  try {
    const stmt = db.prepare('INSERT INTO users (name,email,password_hash,role) VALUES (?,?,?,?)');
    const info = stmt.run(name || '', email, hash, role || 'user');
    const user = { id: info.lastInsertRowid, name, email, role: role || 'user' };
    return res.json({ user });
  } catch (err) {
    return res.status(400).json({ message: 'Erro ao criar usuário (e-mail pode já existir).' });
  }
});

// Login (simple)
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const row = db.prepare('SELECT id, name, email, password_hash, role FROM users WHERE email = ?').get(email);
  if (!row) return res.status(401).json({ message: 'Credenciais inválidas' });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ message: 'Credenciais inválidas' });
  const user = { id: row.id, name: row.name, email: row.email, role: row.role };
  return res.json({ user });
});

// Forgot password
app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  const user = db.prepare('SELECT id,email,name FROM users WHERE email = ?').get(email);
  if (!user) {
    // respond 200 to avoid leaking valid emails
    return res.json({ message: 'Se o email existir, você receberá instruções para resetar a senha.' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  const expires = Date.now() + 60 * 60 * 1000; // 1h
  db.prepare('UPDATE users SET reset_token = ?, reset_expires = ? WHERE id = ?').run(token, expires, user.id);

  const resetUrl = `${FRONTEND_BASE}/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to: email,
    subject: 'Redefinição de senha',
    text: `Olá ${user.name || ''},\n\nClique no link para redefinir sua senha:\n\n${resetUrl}\n\nO link expira em 1 hora.\n\nSe você não solicitou, ignore.`
  };
  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Mail error:', err);
  });

  return res.json({ message: 'Se o email existir, você receberá instruções para resetar a senha.' });
});

// Reset password
app.post('/auth/reset-password', async (req, res) => {
  const { email, token, password } = req.body;
  if (!email || !token || !password) return res.status(400).json({ message: 'Dados incompletos' });
  const user = db.prepare('SELECT id, reset_token, reset_expires FROM users WHERE email = ?').get(email);
  if (!user || !user.reset_token || user.reset_token !== token || user.reset_expires < Date.now()) {
    return res.status(400).json({ message: 'Token inválido ou expirado' });
  }
  const hash = await bcrypt.hash(password, 10);
  db.prepare('UPDATE users SET password_hash = ?, reset_token = NULL, reset_expires = NULL WHERE id = ?').run(hash, user.id);
  return res.json({ message: 'Senha alterada com sucesso' });
});

// Distributors - public read (todos usuários podem ver)
app.get('/distributors', (req, res) => {
  const rows = db.prepare('SELECT id,name,address,status FROM distributors ORDER BY id DESC').all();
  return res.json({ distributors: rows });
});

// add example endpoints for adding/updating distribuidoras
app.post('/distributors', (req, res) => {
  const { name, address } = req.body;
  if (!name) return res.status(400).json({ message: 'Nome obrigatório' });
  const info = db.prepare('INSERT INTO distributors (name,address) VALUES (?,?)').run(name, address || '');
  const row = db.prepare('SELECT id,name,address,status FROM distributors WHERE id = ?').get(info.lastInsertRowid);
  return res.json({ distributor: row });
});

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`);
});
