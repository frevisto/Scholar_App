import rateLimit from 'express-rate-limit';

export const limit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 40,
    standardHeaders: true,
    legacyHeaders: false,
    message: 'Muitas requisições vindas deste IP, por favor tente novamente mais tarde.'
})