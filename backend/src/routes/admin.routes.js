import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import adminController from '../controllers/admin.controller.js';

const router = Router();

// Somente admin
router.use(authMiddleware(['admin']));

router.get('/usuarios', adminController.listarUsuarios);
router.put('/usuarios/:id', adminController.atualizarUsuario);
router.delete('/usuarios/:id', adminController.deletarUsuario);

export default router;
