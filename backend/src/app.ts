import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { limit} from './middleware/rateLimit';
import authRoutes from './routes/authRoutes';

const app = express();
const port = process.env.PORT ? process.env.PORT : console.log('PORT não definido');


app.use(express.json());

app.use(corsMiddleware);

app.use(limit);

app.use('/auth', authRoutes);

app.get('/', (req, res) => {
  res.send('Servidor Express rodando 🚀');
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});