import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes.js';
import alunoRoutes from './routes/aluno.routes.js';
import professorRoutes from './routes/professor.routes.js';
import adminRoutes from './routes/admin.routes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Rotas públicas
app.use('/auth', authRoutes);

// Rotas por perfil
app.use('/aluno', alunoRoutes);
app.use('/professor', professorRoutes);
app.use('/admin', adminRoutes);

// Rota fallback
app.use((req, res) => {
  res.status(404).json({ erro: "Rota não encontrada" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Servidor rodando na porta", PORT));
