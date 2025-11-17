import authService from '../services/auth.service.js';

export default {

  async login(req, res) {
    try {
      const dados = await authService.login(req.body);
      res.json(dados);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async register(req, res) {
    try {
      const dados = await authService.register(req.body);
      res.json(dados);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

};

