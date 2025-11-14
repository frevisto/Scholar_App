import { Router } from 'express';
import { 
  lancarNotas, 
  listarAlunosPorDisciplina 
} from '../controllers/notaController';
import { autenticarToken } from '../middleware/auth';
import { requerirProfessor } from '../middleware/authorization';

const router = Router();

// Todas as rotas exigem autenticação e perfil de professor
router.use(autenticarToken);
router.use(requerirProfessor);

// Lançar/atualizar notas
router.post('/lancar', lancarNotas);

// Listar alunos de uma disciplina (com notas)
router.get('/disciplina/:disciplina_id/alunos', listarAlunosPorDisciplina);

export default router;