// Garantir carregamento do .env antes de qualquer uso
import '../setupEnv';
import bcrypt from 'bcryptjs';
import pool from '../config/database';


async function seed() {
    console.log('🌱 Iniciando seed do banco de dados...');
  
  try {
      const client = await pool.connect();
      console.log('✅ Conectado ao banco de dados para seed.');
      
    // Hash das senhas
    const senhaHash = await bcrypt.hash('senha123', 12);

    // 1. Criar usuário admin
    const adminUser = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'admin') RETURNING id`,
      ['admin@scholar.com', senhaHash]
    );

    await pool.query(
      `INSERT INTO tb_usr_adm (usuario_id, nome) 
       VALUES ($1, $2)`,
      [adminUser.rows[0].id, 'Administrador do Sistema']
    );

    // 2. Criar professores
    const professor1 = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'professor') RETURNING id`,
      ['prof.maria@scholar.com', senhaHash]
    );

    await pool.query(
      `INSERT INTO tb_usr_professores (usuario_id, nome, titulacao, tempo_docencia) 
       VALUES ($1, $2, $3, $4)`,
      [professor1.rows[0].id, 'Prof. Maria Santos', 'Doutora', 8]
    );

    const professor2 = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'professor') RETURNING id`,
      ['prof.carlos@scholar.com', senhaHash]
    );

    await pool.query(
      `INSERT INTO tb_usr_professores (usuario_id, nome, titulacao, tempo_docencia) 
       VALUES ($1, $2, $3, $4)`,
      [professor2.rows[0].id, 'Prof. Carlos Oliveira', 'Mestre', 5]
    );

    // 3. Criar alunos
    const aluno1 = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'aluno') RETURNING id`,
      ['aluno.joao@scholar.com', senhaHash]
    );

    await pool.query(
      `INSERT INTO tb_usr_alunos (usuario_id, nome, matricula, curso) 
       VALUES ($1, $2, $3, $4)`,
      [aluno1.rows[0].id, 'João Silva', '20240001', 'Engenharia de Software']
    );

    const aluno2 = await pool.query(
      `INSERT INTO tb_usuarios (email, senha_hash, tipo_usuario) 
       VALUES ($1, $2, 'aluno') RETURNING id`,
      ['aluna.ana@scholar.com', senhaHash]
    );

    await pool.query(
      `INSERT INTO tb_usr_alunos (usuario_id, nome, matricula, curso) 
       VALUES ($1, $2, $3, $4)`,
      [aluno2.rows[0].id, 'Ana Costa', '20240002', 'Ciência da Computação']
    );

    // 4. Criar disciplinas
    const disciplina1 = await pool.query(
      `INSERT INTO tb_disciplinas (nome, carga_horaria, professor_id) 
       VALUES ($1, $2, $3) RETURNING id`,
      ['Programação Mobile I', 80, 1]
    );

    const disciplina2 = await pool.query(
      `INSERT INTO tb_disciplinas (nome, carga_horaria, professor_id) 
       VALUES ($1, $2, $3) RETURNING id`,
      ['Banco de Dados', 60, 2]
    );

    // 5. Matricular alunos
    await pool.query(
      `INSERT INTO tb_matriculas (aluno_id, disciplina_id, ano_semestre) 
       VALUES ($1, $2, $3)`,
      [1, 1, '2024.1']
    );

    await pool.query(
      `INSERT INTO tb_matriculas (aluno_id, disciplina_id, ano_semestre) 
       VALUES ($1, $2, $3)`,
      [2, 1, '2024.1']
    );

    await pool.query(
      `INSERT INTO tb_matriculas (aluno_id, disciplina_id, ano_semestre) 
       VALUES ($1, $2, $3)`,
      [1, 2, '2024.1']
    );

    console.log('✅ Seed concluído com sucesso!');
    console.log('');
    console.log('👥 Usuários de teste criados:');
    console.log('   Admin: admin@scholar.com / senha123');
    console.log('   Professor: prof.maria@scholar.com / senha123');
    console.log('   Aluno: aluno.joao@scholar.com / senha123');
    console.log('   Aluna: aluna.ana@scholar.com / senha123');
    client.release();
  } catch (error) {
    console.error('❌ Erro no seed:', error);
  } finally {
    pool.end();
  }
}

seed();