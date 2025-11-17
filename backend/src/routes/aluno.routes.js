import { Router } from 'express';
import auth from '../middleware/auth.js';
import alunoController from '../controllers/aluno.controller.js';

const router = Router();

// Apenas alunos podem acessar
router.use(auth(['aluno']));

router.get('/boletim/:matricula', alunoController.boletim);

export default router;
