import pool from '../config/database.js';

export default {

async boletim(matricula) {
  const query = `
    SELECT 
      d.nome AS disciplina,
      n.nota
    FROM notas n
    INNER JOIN disciplinas d ON d.id = n.disciplina_id
    INNER JOIN users u ON u.id = n.aluno_id
    WHERE u.matricula = $1
    ORDER BY d.nome;
  `;

  const { rows } = await pool.query(query, [matricula]);

  // Agrupar por disciplina
  const boletim = {};

  for (const row of rows) {
    if (!boletim[row.disciplina]) {
      boletim[row.disciplina] = {
        disciplina: row.disciplina,
        notas: [],
        media: 0
      };
    }
    boletim[row.disciplina].notas.push(Number(row.nota));
  }

  // calcular médias
  for (const key of Object.keys(boletim)) {
    const notas = boletim[key].notas;
    const media = notas.reduce((a, b) => a + b, 0) / notas.length;
    boletim[key].media = Number(media.toFixed(2));
  }

  // retornar como array
  return Object.values(boletim);
}


};
