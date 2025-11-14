// Carrega variáveis de ambiente o mais cedo possível
import './setupEnv';
import express from 'express';
import cors from 'cors';
import { limit } from './middleware/rateLimit';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import disciplinaRoutes from './routes/disciplinaRoutes';
import notaRoutes from './routes/notaRoutes';
import boletimRoutes from './routes/boletimRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Rotas públicas
app.get('/', (req, res) => {
  res.send('🎓 Scholar App API - Funcionando!');
});

// Rotas de autenticação
app.use('/api/auth', authRoutes);

// Rotas protegidas
app.use('/api/usuarios', userRoutes);
app.use('/api/disciplinas', disciplinaRoutes);
app.use('/api/notas', notaRoutes);
app.use('/api/boletim', boletimRoutes);

app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
  console.log(`📚 Scholar App - Ambiente: ${process.env.NODE_ENV || 'development'}`);
});