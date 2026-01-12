import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { completeFirstLogin } from '../services/authService';

export default function FirstLogin() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setError('');
    try {
      const res = await completeFirstLogin({
        identifier: state?.identifier,
        newPassword: password,
      });
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'No se pudo actualizar la contraseña');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Crea tu contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Nueva contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          className="w-full border rounded px-3 py-2"
          type="password"
          placeholder="Confirma la contraseña"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button className="w-full bg-green-600 text-white rounded px-4 py-2" type="submit">
          Guardar
        </button>
      </form>
    </div>
  );
}