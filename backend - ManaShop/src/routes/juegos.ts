import { Router } from 'express';
import { Request, Response } from 'express';
import {db} from '../db';
import { authMiddleware, ejecutivoMiddleware } from '../middleware/authMiddleware';
import { ResultSetHeader } from 'mysql2';

const router = Router();

// Obtener todos los juegos
router.get('/', (req: Request, res: Response) => {
  db.query('SELECT * FROM juegos', (err, results) => {
    if (err) {
      console.error('Error al obtener los juegos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(results);
  });
});

// Obtener un juego por su ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  db.query('SELECT * FROM juegos WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el juego:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const juegos = results as any[];

    if (juegos.length === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json(juegos[0]);
  });
});

// POST /comprar → simular compra y rebajar stock
router.post('/comprar', authMiddleware, (req: Request, res: Response) => {
  const carrito: { id: number; cantidad: number }[] = req.body.carrito;

  if (!Array.isArray(carrito) || carrito.length === 0) {
    return res.status(400).json({ error: 'Carrito vacío o inválido' });
  }

  // Extraemos los IDs para consultar stock
  const ids = carrito.map(item => item.id);
  const placeholders = ids.map(() => '?').join(',');

  // Consulta para obtener stock actual de esos juegos
  db.query(`SELECT id, stock FROM juegos WHERE id IN (${placeholders})`, ids, (err, results) => {
    if (err) {
      console.error('Error al consultar stock:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Validar que cada juego tiene suficiente stock
    for (const item of carrito) {
      const juego = (results as any[]).find(j => j.id === item.id);
      if (!juego) {
        return res.status(400).json({ error: `Juego con id ${item.id} no existe` });
      }
      if (juego.stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para el juego ${item.id}` });
      }
    }

    // Rebajamos el stock para cada juego
    // Ojo: idealmente usar transacción para evitar problemas
    carrito.forEach(item => {
      db.query('UPDATE juegos SET stock = stock - ? WHERE id = ?', [item.cantidad, item.id], (err) => {
        if (err) {
          console.error('Error al actualizar stock:', err);
        }
      });
    });

    res.json({ mensaje: 'Compra realizada con éxito' });
  });
});

// Añadir un nuevo juego
router.post('/', authMiddleware, ejecutivoMiddleware, (req: Request, res: Response) => {
  const { name, price, image, tipo_id, stock, description } = req.body;

  // Validación de campos obligatorios
  if (!name || price == null || !image || !tipo_id || stock == null || !description) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  // Validación de tipo de datos y valores positivos
  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ error: 'El stock debe ser un número entero mayor o igual a 0' });
  }

  const query = `INSERT INTO juegos (name, price, image, tipo_id, stock, description) 
                 VALUES (?, ?, ?, ?, ?, ?)`;
  const values = [name, price, image, tipo_id, stock, description];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al añadir el juego:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const insertResult = result as ResultSetHeader;
    res.status(201).json({ mensaje: 'Juego añadido con éxito', id: insertResult.insertId });
  });
});

// Editar un juego existente
router.put('/:id', authMiddleware, ejecutivoMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, price, image, tipo_id, stock, description } = req.body;

  // Validaciones
  if (!name || price == null || !image || !tipo_id || stock == null || !description) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  if (typeof price !== 'number' || price <= 0) {
    return res.status(400).json({ error: 'El precio debe ser un número positivo' });
  }

  if (!Number.isInteger(stock) || stock < 0) {
    return res.status(400).json({ error: 'El stock debe ser un número entero mayor o igual a 0' });
  }

  const query = `UPDATE juegos SET name = ?, price = ?, image = ?, tipo_id = ?, stock = ?, description = ? WHERE id = ?`;
  const values = [name, price, image, tipo_id, stock, description, id];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error('Error al actualizar el juego:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const affectedRows = (result as ResultSetHeader).affectedRows;
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ mensaje: 'Juego actualizado con éxito' });
  });
});

// --- RUTA ESPECÍFICA PARA MODIFICAR STOCK (REQUERIMIENTO EJECUTIVO) ---
router.patch('/:id/stock', authMiddleware, ejecutivoMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;
  const { nuevoStock } = req.body;

  // Validación: Que no venga vacío, que sea número y no sea negativo
  if (nuevoStock == null || !Number.isInteger(nuevoStock) || nuevoStock < 0) {
    return res.status(400).json({ error: 'El stock debe ser un número entero mayor o igual a 0' });
  }

  const query = 'UPDATE juegos SET stock = ? WHERE id = ?';
  
  db.query(query, [nuevoStock, id], (err, result) => {
    if (err) {
      console.error('Error al actualizar stock:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const affectedRows = (result as ResultSetHeader).affectedRows;
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ 
      mensaje: 'Stock actualizado con éxito', 
      id: id, 
      stockActualizado: nuevoStock 
    });
  });
});

router.delete('/:id', authMiddleware, ejecutivoMiddleware, (req: Request, res: Response) => {
  const { id } = req.params;

  db.query('DELETE FROM juegos WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el juego:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const affectedRows = (result as ResultSetHeader).affectedRows;

    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Juego no encontrado' });
    }

    res.json({ mensaje: 'Juego eliminado con éxito' });
  });
});

export default router;
