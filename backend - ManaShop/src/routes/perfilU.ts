import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Obtener todos los perfiles de usuario
router.get('/', (req: Request, res: Response) => {
    const query = `
    SELECT 
      perfil_usuario.*, 
      usuario.email, 
      usuario.tipo_usuario 
    FROM perfil_usuario
    JOIN usuario ON perfil_usuario.usuario_id = usuario.id
  `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error al obtener los perfiles:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        res.json(results);
    });
});

// Ruta para mostrar "Bienvenido, nombre"
router.get('/bienvenido', authMiddleware, (req: Request, res: Response) => {
    const userId = (req as any).userId;

    const query = `SELECT nombre FROM perfil_usuario WHERE usuario_id = ?`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error('Error al obtener el nombre:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        // Forzamos que results es un arreglo
        const rows = results as any[];

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }

        const nombre = rows[0].nombre;
        res.json({ mensaje: `Bienvenido, ${nombre}` });
    });
});

router.get('/me', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const query = `
    SELECT 
      perfil_usuario.*, 
      usuario.email, 
      usuario.tipo_usuario 
    FROM perfil_usuario
    JOIN usuario ON perfil_usuario.usuario_id = usuario.id
    WHERE perfil_usuario.usuario_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener el perfil del usuario:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const perfiles = results as any[];

    if (perfiles.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    res.json(perfiles[0]);
  });
});


// Obtener un perfil por ID de usuario (debe ir después de /bienvenido)
router.get('/:id', (req: Request, res: Response) => {
    const { id } = req.params;

    const query = `
    SELECT 
      perfil_usuario.*, 
      usuario.email, 
      usuario.tipo_usuario 
    FROM perfil_usuario
    JOIN usuario ON perfil_usuario.usuario_id = usuario.id
    WHERE perfil_usuario.usuario_id = ?
  `;

    db.query(query, [id], (err, results) => {
        if (err) {
            console.error('Error al obtener el perfil:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }

        const perfiles = results as any[];

        if (perfiles.length === 0) {
            return res.status(404).json({ error: 'Perfil no encontrado' });
        }

        res.json(perfiles[0]);
    });
});

// Obtener los juegos comprados por el usuario autenticado
router.get('/compras/juegos', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;

  const query = `
    SELECT 
      c.id AS compra_id,
      c.fecha_compra,
      c.precio_unitario,
      c.reembolsado,
      j.id AS juego_id,
      j.name,
      j.description,
      j.image,
      j.tipo_id
    FROM compra c
    JOIN juegos j ON c.juego_id = j.id
    WHERE c.usuario_id = ?
    ORDER BY c.fecha_compra DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener los juegos comprados:', err);
      return res.status(500).json({ error: 'Error al obtener los juegos comprados' });
    }

    res.json(results);
  });
});

router.post('/compras', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { juego_id, precio_unitario } = req.body;

  if (!juego_id || !precio_unitario) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

  // Primero, revisar si hay stock disponible
  const checkStockQuery = 'SELECT stock FROM juegos WHERE id = ?';
  db.query(checkStockQuery, [juego_id], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Error al verificar stock' });
    }

    const compras = results as any[];

    if (compras.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    if (compras[0].stock <= 0) {
      return res.status(400).json({ error: 'Juego sin stock disponible' });
    }

    // Resta el stock
    const updateStockQuery = 'UPDATE juegos SET stock = stock - 1 WHERE id = ?';

    db.query(updateStockQuery, [juego_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar stock' });
      }

      // Inserta la compra
      const insertCompraQuery = `
        INSERT INTO compra (usuario_id, juego_id, fecha_compra, precio_unitario, reembolsado)
        VALUES (?, ?, NOW(), ?, 0)
      `;

      db.query(insertCompraQuery, [userId, juego_id, precio_unitario], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al registrar la compra' });
        }

        res.json({ message: 'Compra registrada correctamente' });
      });
    });
  });
});

// Reembolsar una compra
router.put('/compras/reembolsar/:compra_id', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { compra_id } = req.params;

  // Primero, buscar la compra y verificar si pertenece al usuario y no ha sido reembolsada
  const selectCompraQuery = `
    SELECT juego_id, reembolsado 
    FROM compra 
    WHERE id = ? AND usuario_id = ?
  `;

  db.query(selectCompraQuery, [compra_id, userId], (err, results) => {
    if (err) {
      console.error('Error al verificar la compra:', err);
      return res.status(500).json({ error: 'Error al verificar la compra' });
    }

    const compras = results as any[];

    if (compras.length === 0) {
      return res.status(404).json({ error: 'Compra no encontrada o no pertenece al usuario' });
    }

    const { juego_id, reembolsado } = compras[0];

    if (reembolsado) {
      return res.status(400).json({ error: 'Esta compra ya ha sido reembolsada' });
    }

    // Reembolsar: actualizar estado de la compra y devolver el stock
    const updateCompraQuery = `
      UPDATE compra SET reembolsado = 1 WHERE id = ?
    `;
    const updateStockQuery = `
      UPDATE juegos SET stock = stock + 1 WHERE id = ?
    `;

    db.query(updateCompraQuery, [compra_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al reembolsar la compra' });
      }

      db.query(updateStockQuery, [juego_id], (err) => {
        if (err) {
          return res.status(500).json({ error: 'Error al actualizar el stock del juego' });
        }

        res.json({ message: 'Compra reembolsada correctamente' });
      });
    });
  });
});


export default router;
