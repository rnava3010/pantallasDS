import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { completeFirstLogin } from '../services/authService';
import { Lock, CheckCircle, ShieldCheck, Loader2 } from 'lucide-react';

export default function FirstLogin() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await completeFirstLogin({
        identifier: state?.identifier,
        newPassword: password,
      });
      if (res.token) localStorage.setItem('token', res.token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Error al actualizar credenciales');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden mx-4">
        
        {/* Cabecera visual */}
        <div className="bg-blue-600 p-6 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-3">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Seguridad de Cuenta</h2>
          <p className="text-blue-100 text-sm mt-1">Configura tu acceso personal</p>
        </div>

        <div className="p-8">
          <p className="text-gray-600 text-sm mb-6 text-center">
            Es tu primer inicio de sesión. Por seguridad, debes establecer una nueva contraseña permanente.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
              <div className="relative">
                <CheckCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Repite la contraseña"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded">{error}</p>}

            <button
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-lg transition-colors flex justify-center items-center"
              type="submit"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Guardar y Continuar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}