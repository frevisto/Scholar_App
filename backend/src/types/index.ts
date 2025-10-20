export interface Usuario {
  id: number;
  email: string;
  senha_hash: string;
  tipo_usuario: 'aluno' | 'professor' | 'admin';
  criado_em: Date;
}

export interface Aluno {
  id: number;
  usuario_id: number;
  nome: string;
  matricula: string;
  curso: string;
  ativo: boolean;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  token: string;
  usuario: {
    id: number;
    email: string;
    tipo_usuario: string;
    nome: string;
  };
}