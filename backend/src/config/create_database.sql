-- Tabela de usuários (para autenticação unificada)
CREATE TABLE tb_usuarios (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    tipo_usuario VARCHAR(20) NOT NULL CHECK (tipo_usuario IN ('aluno', 'professor', 'admin')),
    criado_em TIMESTAMP DEFAULT NOW()
);

-- Tabela de alunos
CREATE TABLE tb_usr_alunos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES tb_usuarios(id),
    nome VARCHAR(255) NOT NULL,
    matricula VARCHAR(50) UNIQUE NOT NULL,
    curso VARCHAR(255) NOT NULL,
    ativo BOOLEAN DEFAULT TRUE
);

-- Tabela de professores
CREATE TABLE tb_usr_professores (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES tb_usuarios(id),
    nome VARCHAR(255) NOT NULL,
);

-- Tabela de administradores
CREATE TABLE tb_usr_adm (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER REFERENCES tb_usuarios(id),
    nome VARCHAR(255) NOT NULL,
    departamento VARCHAR(100)
);

-- Tabela de disciplinas
CREATE TABLE tb_disciplinas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    carga_horaria INTEGER NOT NULL,
    professor_id INTEGER REFERENCES tb_usr_professores(id),
    ativa BOOLEAN DEFAULT TRUE
);

-- Tabela de matrículas (aluno x disciplina)
CREATE TABLE tb_matriculas (
    id SERIAL PRIMARY KEY,
    aluno_id INTEGER REFERENCES tb_usr_alunos(id),
    disciplina_id INTEGER REFERENCES tb_disciplinas(id),
    ano_semestre VARCHAR(10) NOT NULL,
    situacao VARCHAR(20) DEFAULT 'cursando'
);

-- Tabela de notas
CREATE TABLE tb_notas (
    id SERIAL PRIMARY KEY,
    matricula_id INTEGER REFERENCES tb_matriculas(id),
    nota1 DECIMAL(4,2),
    nota2 DECIMAL(4,2),
    nota3 DECIMAL(4,2),
    media_final DECIMAL(4,2),
    situacao_final VARCHAR(20) DEFAULT 'em andamento'
);

CREATE INDEX idx_usuarios_email ON tb_usuarios(email);
CREATE INDEX idx_alunos_usuario_id ON tb_usr_alunos(usuario_id);
CREATE INDEX idx_professores_usuario_id ON tb_usr_professores(usuario_id);
CREATE INDEX idx_adm_usuario_id ON tb_usr_adm(usuario_id);

CREATE OR REPLACE VIEW vw_usuarios_com_nome AS
SELECT 
  u.*, 
  COALESCE(a.nome, p.nome, adm.nome) AS nome
FROM tb_usuarios u
LEFT JOIN tb_usr_alunos a ON u.id = a.usuario_id
LEFT JOIN tb_usr_professores p ON u.id = p.usuario_id
LEFT JOIN tb_usr_adm adm ON u.id = adm.usuario_id;

CREATE ROLE app_user LOGIN PASSWORD 'app_user_password';
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM app_user;
GRANT SELECT ON vw_usuarios_com_nome TO app_user;
ALTER VIEW vw_usuarios_com_nome OWNER TO postgres;
