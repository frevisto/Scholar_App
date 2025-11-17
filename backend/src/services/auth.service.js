import pool from '../config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

export default {

  async login({ email, senha }) {
    if (!email || !senha) throw new Error("Credenciais incompletas");

    const { rows } = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    if (rows.length === 0) throw new Error("Usuário não encontrado");

    const user = rows[0];

    const ok = await bcrypt.compare(senha, user.senha_hash);
    if (!ok) throw new Error("Senha incorreta");

    const token = jwt.sign(
      { id: user.id, perfil: user.perfil, nome: user.nome, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    return { token, ...user };
    // user.data.values para acessar os dados no cliente
  },

  async register({ nome, email, matricula, senha, perfil }) {
    if (!nome || !email || !senha) throw new Error("Dados incompletos");

    const hash = await bcrypt.hash(senha, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (nome, email, senha_hash, perfil, matricula)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nome, email, perfil, matricula`,
      [nome, email, hash, perfil, matricula]
    );

    return rows[0];
  }

};
