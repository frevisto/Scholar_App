import alunoService from '../services/aluno.service.js';

export default {
  async boletim(req, res) {
    try {
      const boletim = await alunoService.boletim(req.params.matricula);
      res.json({boletim});
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  }
};
