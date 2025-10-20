import { Router } from "express";
import { login } from "../controllers/authController";
import { limit } from "../middleware/rateLimit";

const router = Router();

router.get('/', (req, res) => {
    res.send('Rota de autenticação');
});

router.post('/login', limit, login);

export default router;