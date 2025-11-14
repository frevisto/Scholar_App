import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const cadastrarProfessor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, titulacao, tempo_docencia } = req.body;

    // Verificar se email já existe
    const emailExists = await pool.query(
      'SELECT id FROM tb_usuarios WHERE email = $1',
      [email]
    );

    if (emailExists.rows.length > 0) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Inserir usuário
    const usuarioResult = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'professor') RETURNING id`,
      [email, senhaHash]
    );

    const usuarioId = usuarioResult.rows[0].id;

    // Inserir professor
    await pool.query(
      `INSERT INTO tb_usr_professores (usuario_id, nome, titulacao, tempo_docencia) 
       VALUES ($1, $2, $3, $4)`,
      [usuarioId, nome, titulacao, tempo_docencia]
    );

    res.status(201).json({ 
      message: 'Professor cadastrado com sucesso',
      professor: { nome, email, titulacao }
    });
  } catch (error) {
    console.error('Erro ao cadastrar professor:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const cadastrarAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, email, senha, matricula, curso } = req.body;

    // Verificar se email ou matrícula já existem
    const emailExists = await pool.query(
      'SELECT id FROM tb_usuarios WHERE email = $1',
      [email]
    );

    if (emailExists.rows.length > 0) {
      res.status(400).json({ error: 'Email já cadastrado' });
      return;
    }

    const matriculaExists = await pool.query(
      'SELECT id FROM tb_usr_alunos WHERE matricula = $1',
      [matricula]
    );

    if (matriculaExists.rows.length > 0) {
      res.status(400).json({ error: 'Matrícula já cadastrada' });
      return;
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Inserir usuário
    const usuarioResult = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'aluno') RETURNING id`,
      [email, senhaHash]
    );

    const usuarioId = usuarioResult.rows[0].id;

    // Inserir aluno
    await pool.query(
      `INSERT INTO tb_usr_alunos (usuario_id, nome, matricula, curso) 
       VALUES ($1, $2, $3, $4)`,
      [usuarioId, nome, matricula, curso]
    );

    res.status(201).json({ 
      message: 'Aluno cadastrado com sucesso',
      aluno: { nome, email, matricula, curso }
    });
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarProfessores = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.nome, p.titulacao, p.tempo_docencia, u.email 
      FROM tb_usr_professores p 
      JOIN tb_usuarios u ON p.usuario_id = u.id
      ORDER BY p.nome
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar professores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarAlunos = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT a.id, a.nome, a.matricula, a.curso, u.email 
      FROM tb_usr_alunos a 
      JOIN tb_usuarios u ON a.usuario_id = u.id
      ORDER BY a.nome
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar alunos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};