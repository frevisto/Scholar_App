import pool from '../config/database.js';
import bcrypt from 'bcrypt';

export default {

  async listarUsuarios() {
    const query = `
      SELECT id, nome, email, perfil, matricula
      FROM users
      ORDER BY id;
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async atualizarUsuario(id, dados) {
    const { nome, email, matricula, perfil, senha } = dados;

    const set = [];
    const values = [];
    let idx = 1;

    if (nome) {
      set.push(`nome = $${idx++}`);
      values.push(nome);
    }

    if (email) {
      set.push(`email = $${idx++}`);
      values.push(email);
    }

    if (matricula) {
      set.push(`matricula = $${idx++}`);
      values.push(matricula);
    }

    if (perfil) {
      set.push(`perfil = $${idx++}`);
      values.push(perfil);
    }

    if (senha) {
      const hash = await bcrypt.hash(senha, 10);
      set.push(`senha_hash = $${idx++}`);
      values.push(hash);
    }

    if (set.length === 0) {
      throw new Error("Nenhum campo enviado para atualização");
    }

    values.push(id);

    const query = `
      UPDATE users
      SET ${set.join(", ")}
      WHERE id = $${idx}
      RETURNING id, nome, email, perfil, matricula;
    `;

    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error("Usuário não encontrado");
    }

    return rows[0];
  },

  async deletarUsuario(id) {
    const { rowCount } = await pool.query(
      "DELETE FROM users WHERE id = $1",
      [id]
    );

    if (rowCount === 0) {
      throw new Error("Usuário não encontrado");
    }
  }
};
