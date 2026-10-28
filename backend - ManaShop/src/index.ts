// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';

import usuariosRoutes from './routes/usuario';
import authRoutes from './routes/auth';
import juegosRoutes from './routes/juegos';
import PerfilURoutes from './routes/perfilU';
import TiposJuegos from './routes/tipoJuego';

const app = express();

const corsOptions = {
  origin: 'http://localhost:5173', // la URL de Vite
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// 1. Asegurar que la carpeta 'uploads' exista en el servidor
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}

// 2. Servir públicamente la carpeta para ver las imágenes desde el navegador
app.use('/uploads', express.static(uploadsPath));

// Rutas de la API
app.use('/usuarios', usuariosRoutes);
app.use('/', authRoutes);
app.use('/juegos', juegosRoutes);
app.use('/perfil', PerfilURoutes);
app.use('/tipos', TiposJuegos);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});