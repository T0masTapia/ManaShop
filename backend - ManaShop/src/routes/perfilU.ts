import { Router, Request, Response } from 'express';
import { db } from '../db';
import { authMiddleware } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = Router();

// Configuración de Multer para almacenar avatares
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    // Sube dos niveles desde src/routes hacia la raíz donde está /uploads
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Límite de 2MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (PNG, JPG, JPEG, WEBP)'));
    }
  }
});

// SUBIR O ACTUALIZAR FOTO DE PERFIL DEL USUARIO AUTENTICADO
router.put('/avatar', authMiddleware, upload.single('avatar'), (req: Request, res: Response) => {
  const userId = (req as any).userId;

  if (!req.file) {
    return res.status(400).json({ error: 'No se subió ningún archivo' });
  }

  const nuevaUrl = `http://localhost:3001/uploads/${req.file.filename}`;

  // 1. Consultar la foto anterior que tiene registrada el usuario en la BD
  const sqlBuscar = 'SELECT profile_picture FROM perfil_usuario WHERE usuario_id = ?';

  db.query(sqlBuscar, [userId], (err, results: any[]) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar el perfil: ' + err.message });
    }

    // 2. Si tenía una foto previa guardada, procedemos a borrarla del disco
    if (results.length > 0 && results[0].profile_picture) {
      const fotoViejaUrl: string = results[0].profile_picture;

      // Extraer únicamente el nombre del archivo (ejemplo: "avatar-1792796720480-287122774.jpg")
      const nombreArchivoViejo = path.basename(fotoViejaUrl);

      // Ruta física hacia la carpeta uploads desde la ubicación de este archivo
      // (Si perfilU.ts está en src/routes, sube dos niveles hasta la raíz del backend: ../../uploads)
      const rutaArchivoViejo = path.resolve(__dirname, '../../uploads', nombreArchivoViejo);

      // Verificar que el archivo existe antes de intentar eliminarlo
      if (fs.existsSync(rutaArchivoViejo)) {
        fs.unlink(rutaArchivoViejo, (unlinkErr) => {
          if (unlinkErr) {
            console.error('No se pudo borrar el archivo anterior:', unlinkErr);
          } else {
            console.log(`Avatar anterior eliminado del disco: ${nombreArchivoViejo}`);
          }
        });
      }
    }

    // 3. Actualizar la base de datos con la nueva URL
    const sqlActualizar = 'UPDATE perfil_usuario SET profile_picture = ? WHERE usuario_id = ?';

    db.query(sqlActualizar, [nuevaUrl, userId], (errUpdate) => {
      if (errUpdate) {
        return res.status(500).json({ error: 'Error al actualizar en la base de datos: ' + errUpdate.message });
      }

      res.json({
        mensaje: 'Foto de perfil actualizada con éxito',
        avatarUrl: nuevaUrl
      });
    });
  });
});

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

  const query = `SELECT nombre, profile_picture FROM perfil_usuario WHERE usuario_id = ?`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error al obtener el nombre:', err);
      return res.status(500).json({ error: 'Error interno del servidor' });
    }

    const rows = results as any[];

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Perfil no encontrado' });
    }

    const { nombre, profile_picture } = rows[0];
    res.json({ mensaje: `Bienvenido, ${nombre}`, profile_picture });
  });
});

// Obtener el perfil del usuario autenticado
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

// Obtener un perfil por ID de usuario
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

// Registrar una compra
router.post('/compras', authMiddleware, (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { juego_id, precio_unitario } = req.body;

  if (!juego_id || !precio_unitario) {
    return res.status(400).json({ error: 'Faltan datos' });
  }

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

    const updateStockQuery = 'UPDATE juegos SET stock = stock - 1 WHERE id = ?';

    db.query(updateStockQuery, [juego_id], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Error al actualizar stock' });
      }

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