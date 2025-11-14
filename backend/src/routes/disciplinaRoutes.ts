import { Router } from 'express';
import { 
  cadastrarDisciplina, 
  listarDisciplinas, 
  matricularAluno 
} from '../controllers/disciplinaController';
import { autenticarToken } from '../middleware/auth';
import { requerirAdmin } from '../middleware/authorization';

const router = Router();

// Todas as rotas exigem autenticação
router.use(autenticarToken);

// Apenas admin pode cadastrar disciplinas e matricular alunos
router.post('/', requerirAdmin, cadastrarDisciplina);
router.post('/matricular', requerirAdmin, matricularAluno);

// Qualquer usuário autenticado pode listar disciplinas
router.get('/', listarDisciplinas);

export default router;