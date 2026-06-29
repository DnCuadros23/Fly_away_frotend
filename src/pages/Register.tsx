import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { getErrorMessage } from '../utils';
import type { RegisterRequest } from '../types';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterRequest>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.email || !form.firstName || !form.lastName || !form.password) {
      setError('Todos los campos son obligatorios.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users/register', form);
      setSuccess('Cuenta creada exitosamente. Redirigiendo...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-center">
      <div className="card">
        <h2 className="card-title">Crear cuenta</h2>

        {error && <p className="alert alert-error">{error}</p>}
        {success && <p className="alert alert-success">{success}</p>}

        <form onSubmit={handleSubmit} className="form">
          <label className="label">
            Email
            <input
              className="input"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="ana.garcia@utec.edu.pe"
            />
          </label>

          <label className="label">
            Nombre
            <input
              className="input"
              type="text"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              placeholder="Ana"
            />
          </label>

          <label className="label">
            Apellido
            <input
              className="input"
              type="text"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              placeholder="Garcia"
            />
          </label>

          <label className="label">
            Contraseña
            <input
              className="input"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Mín. 8 chars, 1 mayúscula, 1 número"
            />
          </label>

          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="card-footer">
          ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
}
