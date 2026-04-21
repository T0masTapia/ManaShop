// src/routes/usuarios.ts
import { Router, Request, Response } from 'express';
import { db } from '../db';
import { adminMiddleware, authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// GET usuarios
router.get('/', (req: Request, res: Response) => {
  db.query('SELECT id, tipo_usuario, email FROM usuario', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results as any[]);
  });
});

// GET tipos de usuario
router.get('/tipos', (req: Request, res: Response) => {
  db.query('SELECT DISTINCT tipo_usuario FROM usuario', (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results as any[]);
  });
});

// --- NUEVAS RUTAS PARA EL EJECUTIVO ---

// 1. GET /clientes -> Obtener lista de clientes con su perfil (Para el Panel Maestro)
router.get('/clientes-perfiles', authMiddleware, (req: Request, res: Response) => {
  const sql = `
    SELECT 
      u.id, 
      u.email, 
      p.nombre, 
      p.apellido, 
      p.fono,
      p.direccion
    FROM usuario u
    JOIN perfil_usuario p ON u.id = p.usuario_id
    WHERE u.tipo_usuario = 'cliente'
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results as any[]);
  });
});

// 2. GET /clientes/:id/compras -> Obtener historial de compras de un cliente (Para el Detalle)
router.get('/:id/compras', authMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;

  const sql = `
    SELECT 
      c.id AS compra_id, 
      c.fecha_compra, 
      c.precio_unitario, 
      c.reembolsado,
      j.name AS nombre_juego, 
      j.image AS imagen_juego
    FROM compra c
    JOIN juegos j ON c.juego_id = j.id
    WHERE c.usuario_id = ?
    ORDER BY c.fecha_compra DESC
  `;

  db.query(sql, [id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results as any[]);
  });
});

// GET /reporte-ventas -> Listado global y sumatoria total
router.get('/reporte-ventas', authMiddleware, (req: Request, res: Response) => {
  
  // Consulta que trae quién, qué, cuándo y cuánto
  const sql = `
    SELECT 
      c.id AS compra_id,
      c.fecha_compra,
      c.precio_unitario,
      c.reembolsado,
      p.nombre AS cliente_nombre,
      p.apellido AS cliente_apellido,
      u.email AS cliente_email,
      j.name AS nombre_juego
    FROM compra c
    JOIN usuario u ON c.usuario_id = u.id
    JOIN perfil_usuario p ON u.id = p.usuario_id
    JOIN juegos j ON c.juego_id = j.id
    ORDER BY c.fecha_compra DESC
  `;

  db.query(sql, (err, results: any[]) => {
    if (err) {
      return res.status(500).json({ error: "Error al obtener el reporte: " + err.message });
    }

    // --- LÓGICA DEL VALOR TOTAL POR CONCEPTO DE VENTAS ---
    // Solo sumamos los registros donde 'reembolsado' sea 0 (falso)
    const totalDineroVentas = results
      .filter(venta => venta.reembolsado === 0)
      .reduce((acumulado, ventaActual) => {
        return acumulado + parseFloat(ventaActual.precio_unitario);
      }, 0);

    // Enviamos un objeto limpio al Frontend
    res.json({
      listaVentas: results,
      montoTotalAcumulado: totalDineroVentas,
      cantidadTransacciones: results.length
    });
  });
});

// POST crear usuario
router.post('/', authMiddleware, adminMiddleware,(req: Request, res: Response) => {
  const { email, password, tipo_usuario } = req.body;
  if (!email || !password || !tipo_usuario)
    return res.status(400).json({ error: 'Faltan datos obligatorios' });

  db.query(
    'INSERT INTO usuario (email, password, tipo_usuario) VALUES (?, ?, ?)',
    [email, password, tipo_usuario],
    (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: (results as any).insertId, email, tipo_usuario });
    }
  );
});

// PUT actualizar completo
router.put('/:id', authMiddleware, adminMiddleware,(req: Request, res: Response) => {
  const id = req.params.id;
  const { email, password, tipo_usuario } = req.body;

  if (!email || !password || !tipo_usuario)
    return res.status(400).json({ error: 'Faltan datos para actualización completa' });

  db.query(
    'UPDATE usuario SET email = ?, password = ?, tipo_usuario = ? WHERE id = ?',
    [email, password, tipo_usuario, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuario actualizado completamente' });
    }
  );
});

// PATCH actualizar datos propios (ej. contraseña)
router.patch('/me', authMiddleware, (req: Request, res: Response) => {
  const id = (req as any).userId; 
  const { email, password } = req.body;

  const fields: string[] = [];
  const values: any[] = [];

  if (email) {
    fields.push('email = ?');
    values.push(email);
  }
  if (password) {
    fields.push('password = ?');
    values.push(password);
  }

  if (fields.length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  db.query(
    `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Datos actualizados correctamente' });
    }
  );
});



// PATCH actualizar parcial
router.patch('/:id', authMiddleware, adminMiddleware,(req: Request, res: Response) => {
  const id = req.params.id;
  const { email, password, tipo_usuario } = req.body;

  const fields: string[] = [];
  const values: any[] = [];

  if (email) {
    fields.push('email = ?');
    values.push(email);
  }
  if (password) {
    fields.push('password = ?');
    values.push(password);
  }
  if (tipo_usuario) {
    fields.push('tipo_usuario = ?');
    values.push(tipo_usuario);
  }

  if (fields.length === 0)
    return res.status(400).json({ error: 'No hay campos para actualizar' });

  db.query(
    `UPDATE usuario SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ message: 'Usuario actualizado parcialmente' });
    }
  );
});

// DELETE eliminar usuario
router.delete('/:id', authMiddleware, adminMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = (req as any).userId;

  if (Number(id) === Number(userId)) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo.' });
  }

  db.query('DELETE FROM usuario WHERE id = ?', [id], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if ((result as any).affectedRows === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' });

    res.json({ message: 'Usuario eliminado correctamente' });
  });
});


export default router;
