import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { LoginRequest, LoginResponse } from '../types';

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário
    const userQuery = `
      SELECT * 
      FROM vw_usuarios_com_nome
      WHERE email = $1
    `;

    const userResult = await pool.query(userQuery, [email]);
    
    if (userResult.rows.length === 0) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    const usuario = userResult.rows[0];

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    
    if (!senhaValida) {
      res.status(401).json({ error: 'Credenciais inválidas' });
      return;
    }

    // Gerar JWT
    const token = jwt.sign(
      { 
        id: usuario.id, 
        tipo_usuario: usuario.tipo_usuario 
      },
      process.env.JWT_SECRET!,
      { expiresIn: '24h'}
    );

    const response: LoginResponse = {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        nome: usuario.nome
      }
    };

    res.json(response);

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
