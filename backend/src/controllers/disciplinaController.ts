import { Request, Response } from 'express';
import pool from '../config/database';

export const cadastrarDisciplina = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nome, carga_horaria, professor_id } = req.body;

    // Verificar se professor existe
    const professorExists = await pool.query(
      'SELECT id FROM tb_usr_professores WHERE id = $1',
      [professor_id]
    );

    if (professorExists.rows.length === 0) {
      res.status(404).json({ error: 'Professor não encontrado' });
      return;
    }

    // Inserir disciplina
    const result = await pool.query(
      `INSERT INTO tb_disciplinas (nome, carga_horaria, professor_id) 
       VALUES ($1, $2, $3) RETURNING id, nome, carga_horaria, professor_id`,
      [nome, carga_horaria, professor_id]
    );

    res.status(201).json({ 
      message: 'Disciplina cadastrada com sucesso',
      disciplina: result.rows[0]
    });
  } catch (error) {
    console.error('Erro ao cadastrar disciplina:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarDisciplinas = async (req: Request, res: Response): Promise<void> => {
  try {
    const result = await pool.query(`
      SELECT 
        d.id,
        d.nome,
        d.carga_horaria,
        d.professor_id,
        p.nome as professor_nome
      FROM tb_disciplinas d
      LEFT JOIN tb_usr_professores p ON d.professor_id = p.id
      ORDER BY d.nome
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar disciplinas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const matricularAluno = async (req: Request, res: Response): Promise<void> => {
  try {
    const { aluno_id, disciplina_id, ano_semestre } = req.body;

    // Verificar se aluno e disciplina existem
    const [alunoExists, disciplinaExists] = await Promise.all([
      pool.query('SELECT id FROM tb_usr_alunos WHERE id = $1', [aluno_id]),
      pool.query('SELECT id FROM tb_disciplinas WHERE id = $1', [disciplina_id])
    ]);

    if (alunoExists.rows.length === 0) {
      res.status(404).json({ error: 'Aluno não encontrado' });
      return;
    }

    if (disciplinaExists.rows.length === 0) {
      res.status(404).json({ error: 'Disciplina não encontrada' });
      return;
    }

    // Verificar se já está matriculado
    const matriculaExists = await pool.query(
      `SELECT id FROM tb_matriculas 
       WHERE aluno_id = $1 AND disciplina_id = $2 AND ano_semestre = $3`,
      [aluno_id, disciplina_id, ano_semestre]
    );

    if (matriculaExists.rows.length > 0) {
      res.status(400).json({ error: 'Aluno já matriculado nesta disciplina' });
      return;
    }

    // Inserir matrícula
    const result = await pool.query(
      `INSERT INTO tb_matriculas (aluno_id, disciplina_id, ano_semestre) 
       VALUES ($1, $2, $3) RETURNING id`,
      [aluno_id, disciplina_id, ano_semestre]
    );

    res.status(201).json({ 
      message: 'Aluno matriculado com sucesso',
      matricula_id: result.rows[0].id
    });
  } catch (error) {
    console.error('Erro ao matricular aluno:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};