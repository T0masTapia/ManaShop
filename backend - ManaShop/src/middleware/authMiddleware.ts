// authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'tu_clave_secreta';

interface JwtPayload {
  userId: number;
  tipo_usuario: string;
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No se proporcionó token' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token inválido' });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;
    (req as any).userId = payload.userId;
    (req as any).tipo_usuario = payload.tipo_usuario;
    next();
  } catch {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}


export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  console.log('adminMiddleware ejecutado, ruta:', req.originalUrl, 'tipo_usuario:', (req as any).tipo_usuario);
  if ((req as any).tipo_usuario !== 'admi') {
    return res.status(403).json({ error: 'Acceso denegado: solo administradores' });
  }
  next();
}

export function ejecutivoMiddleware(req: Request, res: Response, next: NextFunction) {
  if ((req as any).tipo_usuario !== 'ejecutivo') {
    return res.status(403).json({ error: 'Acceso denegado: solo ejecutivos' });
  }
  next();
}