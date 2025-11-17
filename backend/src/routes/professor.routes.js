import { Router } from 'express';
import authMiddleware from '../middleware/auth.js';
import professorController from '../controllers/professor.controller.js';

const router = Router();

// Todos exigem perfil professor
router.use(authMiddleware(['professor']));

// Cadastrar disciplina (OK NO FRONT)
router.post('/disciplina', professorController.criarDisciplina);

// Listar disciplinas (OK NO FRONT)
router.get('/minhas-disciplinas', professorController.listarDisciplinas);

// Atualizar disciplina (OK NO FRONT)
router.put('/disciplina/:id', professorController.atualizarDisciplina);

// Deletar disciplina
router.delete('/disciplina/:id', professorController.deletarDisciplina);

// Listar alunos
router.get('/alunos', professorController.listarAlunos);

// Matricular aluno em disciplina
router.post('/matriculas', professorController.matricularAluno);
// Lançar notas para alunos
router.post('/notas', professorController.lancarNotas);


// Listar notas dos alunos ( FALTA IMPLEMENTAR )
router.get('/notas', professorController.listarNotas);

// Listar alunos de uma disciplina (FALTA IMPLEMENTAR')
router.get(
  '/disciplinas/:id/alunos',
  professorController.listarAlunosDaDisciplina
);


export default router;