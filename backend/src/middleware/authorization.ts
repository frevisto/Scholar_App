import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';

export const requerirRole = (rolesPermitidos: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.usuario) {
      res.status(401).json({ error: 'Não autenticado' });
      return;
    }

    if (!rolesPermitidos.includes(req.usuario.tipo_usuario)) {
      res.status(403).json({ 
        error: 'Acesso negado. Permissões necessárias: ' + rolesPermitidos.join(', ')
      });
      return;
    }

    next();
  };
};

// Middlewares específicos para cada role
export const requerirAdmin = requerirRole(['admin']);
export const requerirProfessor = requerirRole(['professor', 'admin']);
export const requerirAluno = requerirRole(['aluno', 'professor', 'admin']);