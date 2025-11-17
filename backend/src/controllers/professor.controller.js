import professorService from "../services/professor.service.js";

export default {
  async criarDisciplina(req, res) {
    try {
      const result = await professorService.criarDisciplina(
        req.user.id,
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async listarDisciplinas(req, res) {
    try {
      const result = await professorService.listarDisciplinas(req.user.id);
      res.json(result);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async listarAlunosDaDisciplina(req, res) {
    try {
      const professorId = req.user.id;
      const disciplinaId = req.params.id;

      const alunos = await professorService.listarAlunosDaDisciplina(
        professorId,
        disciplinaId
      );

      res.json(alunos);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },
  async atualizarDisciplina(req, res) {
    try {
      const result = await professorService.atualizarDisciplina(
        req.user.id,
        req.params.id,
        req.body
      );
      res.json(result);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async deletarDisciplina(req, res) {
    try {
      await professorService.deletarDisciplina(req.user.id, req.params.id);
      res.json({ msg: "Disciplina removida" });
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async listarAlunos(req, res) {
    try {
      const result = await professorService.listarAlunos();
      res.json(result);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async matricularAluno(req, res) {
    try {
      // req.user vem do middleware (id do professor)
      const professorId = req.user.id;
      const result = await professorService.matricularAluno(
        req.body,
        professorId
      );
      res.json(result);
    } catch (err) {
      console.error("matricularAluno error:", err);
      res.status(400).json({ erro: err.message });
    }
  },

  async lancarNotas(req, res) {
    try {
      const professorId = req.user.id;
      const result = await professorService.lancarNotas(req.body, professorId);
      res.json(result);
    } catch (err) {
      console.error("lancarNotas error:", err);
      res.status(400).json({ erro: err.message });
    }
  },

  async listarNotas(req, res) {
    try {
      const result = await professorService.listarNotas(req.body);
      res.json(result);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },
};
