import jwt from 'jsonwebtoken';

export default function authMiddleware(perfisPermitidos = []) {

  return (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) return res.status(401).json({ erro: "Token ausente" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Se o array estiver vazio, qualquer perfil pode
      if (perfisPermitidos.length > 0 && !perfisPermitidos.includes(decoded.perfil)) {
        return res.status(403).json({ erro: "Acesso negado" });
      }

      next();

    } catch (err) {
      return res.status(401).json({ erro: "Token inválido" });
    }
  };
}
