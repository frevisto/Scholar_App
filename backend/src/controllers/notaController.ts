import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const lancarNotas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { matricula_id, nota1, nota2, nota3 } = req.body;
    const professorId = req.usuario?.id;

    // Verificar se a matrícula existe e se o professor é o responsável pela disciplina
    const matriculaQuery = await pool.query(`
      SELECT m.*, d.professor_id, d.nome as disciplina_nome, a.nome as aluno_nome
      FROM tb_matriculas m
      JOIN tb_disciplinas d ON m.disciplina_id = d.id
      JOIN tb_usr_alunos a ON m.aluno_id = a.id
      WHERE m.id = $1
    `, [matricula_id]);

    if (matriculaQuery.rows.length === 0) {
      res.status(404).json({ error: 'Matrícula não encontrada' });
      return;
    }

    const matricula = matriculaQuery.rows[0];

    // Verificar se o professor logado é o responsável pela disciplina
    if (matricula.professor_id !== professorId) {
      res.status(403).json({ error: 'Você só pode lançar notas para suas próprias disciplinas' });
      return;
    }

    // Verificar se já existe registro de notas
    const notaExists = await pool.query(
      'SELECT id FROM tb_notas WHERE matricula_id = $1',
      [matricula_id]
    );

    let result;
    if (notaExists.rows.length > 0) {
      // Atualizar notas existentes
      result = await pool.query(
        `UPDATE tb_notas 
         SET nota1 = $1, nota2 = $2, nota3 = $3 
         WHERE matricula_id = $4 
         RETURNING *`,
        [nota1, nota2, nota3, matricula_id]
      );
    } else {
      // Inserir novas notas
      result = await pool.query(
        `INSERT INTO tb_notas (matricula_id, nota1, nota2, nota3) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [matricula_id, nota1, nota2, nota3]
      );
    }

    res.json({
      message: 'Notas lançadas com sucesso',
      notas: result.rows[0],
      aluno: matricula.aluno_nome,
      disciplina: matricula.disciplina_nome
    });
  } catch (error) {
    console.error('Erro ao lançar notas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listarAlunosPorDisciplina = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { disciplina_id } = req.params;
    const professorId = req.usuario?.id;

    // Verificar se o professor é responsável pela disciplina
    const disciplinaQuery = await pool.query(
      'SELECT id, nome FROM tb_disciplinas WHERE id = $1 AND professor_id = $2',
      [disciplina_id, professorId]
    );

    if (disciplinaQuery.rows.length === 0) {
      res.status(403).json({ error: 'Disciplina não encontrada ou acesso negado' });
      return;
    }

    const result = await pool.query(`
      SELECT 
        m.id as matricula_id,
        a.id as aluno_id,
        a.nome as aluno_nome,
        a.matricula,
        n.nota1,
        n.nota2,
        n.nota3,
        n.media_final,
        n.situacao
      FROM tb_matriculas m
      JOIN tb_usr_alunos a ON m.aluno_id = a.id
      LEFT JOIN tb_notas n ON m.id = n.matricula_id
      WHERE m.disciplina_id = $1
      ORDER BY a.nome
    `, [disciplina_id]);

    res.json({
      disciplina: disciplinaQuery.rows[0],
      alunos: result.rows
    });
  } catch (error) {
    console.error('Erro ao listar alunos da disciplina:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};