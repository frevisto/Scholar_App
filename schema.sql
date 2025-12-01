-- === DROPS ===
DROP TABLE IF EXISTS notas CASCADE;
DROP TABLE IF EXISTS matriculas CASCADE;
DROP TABLE IF EXISTS disciplinas CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Cria o banco e tabelas essenciais para o App Scholar
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  senha_hash TEXT NOT NULL,
  perfil TEXT NOT NULL CHECK (perfil IN ('admin','professor','aluno')),
  matricula VARCHAR(30) NULL
);

CREATE TABLE disciplinas (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  area TEXT,
  carga_horaria INT,
  coordenador TEXT,
  professor_id INT REFERENCES users(id)
);

CREATE TABLE matriculas (
  id SERIAL PRIMARY KEY,
  aluno_id INT REFERENCES users(id) ON DELETE CASCADE,
  disciplina_id INT REFERENCES disciplinas(id) ON DELETE CASCADE,
  UNIQUE(aluno_id, disciplina_id)
);

CREATE TABLE notas (
  id SERIAL PRIMARY KEY,
  aluno_id INT REFERENCES users(id) ON DELETE CASCADE,
  disciplina_id INT REFERENCES disciplinas(id) ON DELETE CASCADE,
  nota NUMERIC(5,2),
  data TIMESTAMP DEFAULT now()
);