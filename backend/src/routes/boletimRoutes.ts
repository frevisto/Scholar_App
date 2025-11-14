import { Router } from 'express';
import { 
  consultarMeuBoletim, 
  consultarMinhasDisciplinas 
} from '../controllers/boletimController';
import { autenticarToken } from '../middleware/auth';
import { requerirAluno } from '../middleware/authorization';

const router = Router();

// Todas as rotas exigem autenticação e perfil de aluno
router.use(autenticarToken);
router.use(requerirAluno);

// Consultar boletim do próprio aluno
router.get('/me', consultarMeuBoletim);

// Consultar disciplinas matriculadas
router.get('/disciplinas', consultarMinhasDisciplinas);

export default router;