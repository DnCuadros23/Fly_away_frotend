import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { token, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <Link to="/flights" className="navbar-brand">
        ✈ Fly Away
      </Link>

      <ul className="navbar-links">
        <li>
          <Link to="/flights">Vuelos</Link>
        </li>
        {token && (
          <li>
            <Link to="/my-bookings">Mis reservas</Link>
          </li>
        )}
      </ul>

      <div className="navbar-auth">
        {token ? (
          <>
            <span className="navbar-user">{currentUser?.username}</span>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>
              Cerrar sesión
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-outline btn-sm">
              Iniciar sesión
            </Link>
            <Link to="/register" className="btn btn-primary btn-sm">
              Registrarse
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
