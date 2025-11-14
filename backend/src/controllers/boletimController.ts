import { Request, Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const consultarMeuBoletim = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;

    // Buscar ID do aluno baseado no usuário logado
    const alunoQuery = await pool.query(
      'SELECT id, nome, matricula, curso FROM tb_usr_alunos WHERE usuario_id = $1',
      [usuarioId]
    );

    if (alunoQuery.rows.length === 0) {
      res.status(404).json({ error: 'Aluno não encontrado' });
      return;
    }

    const aluno = alunoQuery.rows[0];

    // Buscar boletim do aluno
    const boletimQuery = await pool.query(`
      SELECT 
        d.nome as disciplina,
        p.nome as professor,
        n.nota1,
        n.nota2,
        n.nota3,
        n.media_final,
        CASE 
          WHEN n.media_final >= 7 THEN 'aprovado'
          WHEN n.media_final >= 4 THEN 'recuperação'
          ELSE 'reprovado'
        END as situacao
      FROM tb_matriculas m
      JOIN tb_disciplinas d ON m.disciplina_id = d.id
      LEFT JOIN tb_usr_professores p ON d.professor_id = p.id
      LEFT JOIN tb_notas n ON m.id = n.matricula_id
      WHERE m.aluno_id = $1
      ORDER BY d.nome
    `, [aluno.id]);

    res.json({
      aluno: {
        nome: aluno.nome,
        matricula: aluno.matricula,
        curso: aluno.curso
      },
      boletim: boletimQuery.rows
    });
  } catch (error) {
    console.error('Erro ao consultar boletim:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const consultarMinhasDisciplinas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usuarioId = req.usuario?.id;

    // Buscar ID do aluno
    const alunoQuery = await pool.query(
      'SELECT id FROM tb_usr_alunos WHERE usuario_id = $1',
      [usuarioId]
    );

    if (alunoQuery.rows.length === 0) {
      res.status(404).json({ error: 'Aluno não encontrado' });
      return;
    }

    const alunoId = alunoQuery.rows[0].id;

    // Buscar disciplinas matriculadas
    const disciplinasQuery = await pool.query(`
      SELECT 
        d.id,
        d.nome,
        d.carga_horaria,
        p.nome as professor,
        m.ano_semestre
      FROM tb_matriculas m
      JOIN tb_disciplinas d ON m.disciplina_id = d.id
      LEFT JOIN tb_usr_professores p ON d.professor_id = p.id
      WHERE m.aluno_id = $1
      ORDER BY d.nome
    `, [alunoId]);

    res.json(disciplinasQuery.rows);
  } catch (error) {
    console.error('Erro ao consultar disciplinas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};