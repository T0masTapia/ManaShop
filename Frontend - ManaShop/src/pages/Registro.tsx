import { Link } from 'react-router-dom';
// import '../styles/registro.css'; // si quieres estilos específicos

const Registro = () => {
  return (
    <div className="registro-container">
      <div className="registro-box shadow">
        <h2 className="text-center mb-4">Unete a <span className="brand">ManaShop</span></h2>
        <form>
          {/* campos similares al login, pero para registro */}
          <div className="form-group mb-3">
            <label htmlFor="nombre" className="form-label">Nombre completo</label>
            <input type="text" className="form-control" id="nombre" placeholder="Tu nombre" />
          </div>

          <div className="form-group mb-3">
            <label htmlFor="email" className="form-label">Correo electrónico</label>
            <input type="email" className="form-control" id="email" placeholder="correo@ejemplo.com" />
          </div>

          <div className="form-group mb-4">
            <label htmlFor="password" className="form-label">Contraseña</label>
            <input type="password" className="form-control" id="password" placeholder="********" />
          </div>

          <button type="submit" className="btn btn-primary w-100">Registrarse</button>
        </form>

        <div className="text-center mt-3">
          <small>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></small>
        </div>
      </div>
    </div>
  );
};

export default Registro;
