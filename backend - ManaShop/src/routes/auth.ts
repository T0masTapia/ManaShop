import { Router, Request, Response } from 'express';
import { db } from '../db';
import jwt from 'jsonwebtoken';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Faltan datos' });

  const query = `
    SELECT 
      usuario.id,
      usuario.email,
      usuario.tipo_usuario,
      usuario.password,
      perfil_usuario.nombre,
      perfil_usuario.apellido
    FROM usuario
    JOIN perfil_usuario ON perfil_usuario.usuario_id = usuario.id
    WHERE usuario.email = ?
  `;

  db.query(query, [email], (err, results) => {
    if (err) return res.status(500).json({ error: 'Error del servidor' });

    const usuarios = results as any[];
    if (usuarios.length === 0)
      return res.status(401).json({ error: 'Usuario no encontrado' });

    const user = usuarios[0];
    if (user.password !== password)
      return res.status(401).json({ error: 'Contraseña incorrecta' });

    const { password: pwd, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { userId: user.id, email: user.email, tipo_usuario: user.tipo_usuario },
      process.env.JWT_SECRET || 'tu_clave_secreta',
      { expiresIn: '1h' }
    );

    res.json({
      token,
      usuario: userWithoutPassword // Incluye nombre aquí
    });
  });
});


export default router;
