import adminService from '../services/admin.service.js';

export default {

  async listarUsuarios(req, res) {
    try {
      const users = await adminService.listarUsuarios();
      res.json(users);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async atualizarUsuario(req, res) {
    try {
      const updated = await adminService.atualizarUsuario(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

  async deletarUsuario(req, res) {
    try {
      await adminService.deletarUsuario(req.params.id);
      res.json({ msg: "Usuário removido" });
    } catch (err) {
      res.status(400).json({ erro: err.message });
    }
  },

};
