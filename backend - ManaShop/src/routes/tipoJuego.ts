import { Router } from 'express';
import { Request, Response } from 'express';
import { db } from '../db'; // tu conexión a MySQL

const router = Router();

// GET /tipos → obtener todos los tipos
router.get('/', (req: Request, res: Response) => {
  db.query('SELECT * FROM tipo', (err, results) => {
    if (err) {
      console.error('Error al obtener los tipos:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    res.json(results);
  });
});

// GET /tipos/:id → obtener tipo por ID
router.get('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  db.query('SELECT * FROM tipo WHERE id = ?', [id], (err, results) => {
    if (err) {
      console.error('Error al obtener el tipo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const tipos = results as any[];

    if (tipos.length === 0) {
      return res.status(404).json({ error: 'Tipo no encontrado' });
    }

    res.json(tipos[0]);
  });
});

// POST /tipos → crear un nuevo tipo
router.post('/', (req: Request, res: Response) => {
  const { category } = req.body;

  if (!category) {
    return res.status(400).json({ error: 'Falta el campo category' });
  }

  const sql = 'INSERT INTO tipo (category) VALUES (?)';

  db.query(sql, [category], (err, result) => {
    if (err) {
      console.error('Error al crear el tipo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // result.insertId tiene el id generado
    res.status(201).json({ id: (result as any).insertId, category });
  });
});

// PATCH /tipos/:id → actualizar solo el campo category
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const { category } = req.body;

  if (!category || typeof category !== 'string' || !category.trim()) {
    return res.status(400).json({ error: 'Campo category es requerido y no puede estar vacío' });
  }

  const sql = 'UPDATE tipo SET category = ? WHERE id = ?';

  db.query(sql, [category.trim(), id], (err, result) => {
    if (err) {
      console.error('Error al actualizar el tipo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Verificamos si se actualizó alguna fila
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Tipo no encontrado' });
    }

    res.json({ id: Number(id), category: category.trim() });
  });
});

// DELETE /tipos/:id → eliminar tipo por ID
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;

  const sql = 'DELETE FROM tipo WHERE id = ?';

  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error al eliminar el tipo:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    // Verificamos si se eliminó alguna fila
    if ((result as any).affectedRows === 0) {
      return res.status(404).json({ error: 'Tipo no encontrado' });
    }

    res.status(204).send(); // No content, eliminación exitosa
  });
});



export default router