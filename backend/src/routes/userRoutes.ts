import { Router } from 'express';
import { 
  cadastrarProfessor, 
  cadastrarAluno, 
  listarProfessores, 
  listarAlunos 
} from '../controllers/userController';
import { autenticarToken } from '../middleware/auth'
import { requerirAdmin } from '../middleware/auth';

const router = Router();

// Todas as rotas exigem autenticação e perfil admin
router.use(autenticarToken);
router.use(requerirAdmin);

// Cadastro
router.post('/professores', cadastrarProfessor);
router.post('/alunos', cadastrarAluno);

// Listagem
router.get('/professores', listarProfessores);
router.get('/alunos', listarAlunos);

export default router;