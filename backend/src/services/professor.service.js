import pool from "../config/database.js";

export default {
  async criarDisciplina(professorId, dados) {
    const { nome, area, carga_horaria, coordenador } = dados;

    if (!nome || !area || !carga_horaria || !coordenador) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const query = `
      INSERT INTO disciplinas (nome, area, carga_horaria, coordenador, professor_id)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      nome,
      area,
      carga_horaria,
      coordenador,
      professorId,
    ]);

    return rows[0];
  },
  async listarDisciplinas(professorId) {
    const query = `
      SELECT *
      FROM disciplinas
      WHERE professor_id = $1
      ORDER BY id DESC;
    `;
    const { rows } = await pool.query(query, [professorId]);
    return rows;
  },

 async atualizarDisciplina(professorId, id, dados) {
    const { nome, area, carga_horaria, coordenador } = dados;

    if (!nome || !area || !carga_horaria || !coordenador) {
      throw new Error("Todos os campos são obrigatórios");
    }

    const query = `
      UPDATE disciplinas
      SET nome = $1,
          area = $2,
          carga_horaria = $3,
          coordenador = $4
      WHERE id = $5 AND professor_id = $6
      RETURNING *;
    `;

    const { rows } = await pool.query(query, [
      nome,
      area,
      carga_horaria,
      coordenador,
      id,
      professorId,
    ]);

    if (rows.length === 0) {
      throw new Error(
        "Disciplina não encontrada ou não pertence ao professor"
      );
    }

    return rows[0];
  },

  async deletarDisciplina(professorId, id) {
    const query = `
      DELETE FROM disciplinas
      WHERE id = $1 AND professor_id = $2
    `;
    const result = await pool.query(query, [id, professorId]);
    if (result.rowCount === 0) throw new Error("Disciplina não encontrada");
  },

  async listarAlunos() {
    const query = `
      SELECT *
      FROM users u
      WHERE u.perfil = 'aluno';
    `;
    const { rows } = await pool.query(query);
    return rows;
  },

  async listarAlunosDaDisciplina(professorId, disciplinaId) {
    const query = `
    SELECT 
      u.id AS aluno_id,
      u.nome,
      u.matricula,
      n.nota,
      n.data
    FROM matriculas m
    JOIN users u ON u.id = m.aluno_id
    LEFT JOIN LATERAL (
        SELECT nota, data
        FROM notas
        WHERE notas.aluno_id = m.aluno_id
          AND notas.disciplina_id = m.disciplina_id
        ORDER BY data DESC
        LIMIT 1
    ) n ON TRUE
    JOIN disciplinas d ON d.id = m.disciplina_id
    WHERE m.disciplina_id = $1
      AND d.professor_id = $2
    ORDER BY u.nome;
  `;

    const { rows } = await pool.query(query, [disciplinaId, professorId]);

    return rows;
  },

  // matricular aluno: converte matricula para id, checa disciplina e cria matrícula
  async matricularAluno({ aluno_matricula, disciplina_id }, professorId) {
    // validações básicas
    if (!aluno_matricula) throw new Error("Matrícula do aluno é obrigatória");
    if (!disciplina_id) throw new Error("disciplina_id é obrigatório");

    // Verifica se disciplina existe e pertence ao professor
    const dRes = await pool.query(
      "SELECT id, nome FROM disciplinas WHERE id = $1 AND professor_id = $2",
      [disciplina_id, professorId]
    );
    if (dRes.rows.length === 0)
      throw new Error("Disciplina não encontrada ou não pertence ao professor");

    // Busca o id do aluno pela matrícula
    const uRes = await pool.query("SELECT id FROM users WHERE matricula = $1", [
      aluno_matricula,
    ]);
    if (uRes.rows.length === 0)
      throw new Error("Aluno não encontrado pela matrícula informada");

    const aluno_id = uRes.rows[0].id;

    // Checar se já está matriculado
    const check = await pool.query(
      "SELECT id FROM matriculas WHERE aluno_id = $1 AND disciplina_id = $2",
      [aluno_id, disciplina_id]
    );
    if (check.rows.length > 0)
      throw new Error("Aluno já está matriculado nesta disciplina");

    // Inserir matrícula
    const insertQuery = `
      INSERT INTO matriculas (aluno_id, disciplina_id)
      VALUES ($1, $2)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertQuery, [aluno_id, disciplina_id]);
    return rows[0];
  },
  // lançar notas: mesmo processo de lookup do aluno
  async lancarNotas({ aluno_matricula, disciplina_id, nota }, professorId) {
    if (!aluno_matricula) throw new Error("Matrícula do aluno é obrigatória");
    if (!disciplina_id) throw new Error("disciplina_id é obrigatório");
    if (nota === undefined || nota === null)
      throw new Error("Nota é obrigatória");

    // Verifica disciplina pertence ao professor
    const dRes = await pool.query(
      "SELECT id FROM disciplinas WHERE id = $1 AND professor_id = $2",
      [disciplina_id, professorId]
    );
    if (dRes.rows.length === 0)
      throw new Error("Disciplina não encontrada ou não pertence ao professor");

    // Busca aluno
    const uRes = await pool.query("SELECT id FROM users WHERE matricula = $1", [
      aluno_matricula,
    ]);
    if (uRes.rows.length === 0)
      throw new Error("Aluno não encontrado pela matrícula informada");
    const aluno_id = uRes.rows[0].id;

    // Opcional: checar se matriculado — dependendo da sua regra, pode exigir matrícula prévia
    const checkMat = await pool.query(
      "SELECT id FROM matriculas WHERE aluno_id = $1 AND disciplina_id = $2",
      [aluno_id, disciplina_id]
    );
    if (checkMat.rows.length === 0) {
      throw new Error("Aluno não está matriculado nesta disciplina");
    }

    // Inserir nota (ou atualizar se já existir, dependendo do seu modelo)
    // Vou inserir uma nova linha; se quiser UPDATE ou upsert, ajuste.
    const insertNotaQuery = `
      INSERT INTO notas (aluno_id, disciplina_id, nota)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    const { rows } = await pool.query(insertNotaQuery, [
      aluno_id,
      disciplina_id,
      nota,
    ]);
    return rows[0];
  },

  // listar notas de uma disciplina (CRIAR VIEW NO FRONT)
  async listarNotas(req) {
    const query = `
    SELECT n.*, u.nome AS aluno_nome, u.matricula AS aluno_matricula
    FROM notas n
    JOIN users u ON n.aluno_id = u.id
    WHERE n.disciplina_id = $1;
    `;
    const { disciplina_id } = req.body;
    const { rows } = await pool.query(query, [disciplina_id]);
    return rows;
  },
};
