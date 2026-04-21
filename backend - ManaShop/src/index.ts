// src/index.ts
import express from 'express';
import cors from 'cors';
import usuariosRoutes from './routes/usuario';
import authRoutes from './routes/auth';
import juegosRoutes from './routes/juegos';
import PerfilURoutes from './routes/perfilU';
import TiposJuegos from './routes/tipoJuego';


const app = express();
const corsOptions = {
  origin: 'http://localhost:5173',  // la URL exacta de tu frontend
  credentials: true,                 // permite enviar cookies, headers de auth, etc.
};

app.use(cors(corsOptions));

app.use(express.json());


app.use('/usuarios', usuariosRoutes);
app.use('/', authRoutes);
app.use('/juegos', juegosRoutes);
app.use('/perfil', PerfilURoutes);
app.use('/tipos', TiposJuegos)

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});
