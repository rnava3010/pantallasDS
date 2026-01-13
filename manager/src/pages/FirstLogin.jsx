// manager/src/pages/FirstLogin.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { completeFirstLogin } from '../services/authService';
import { Lock, ShieldCheck, Loader2, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export default function FirstLogin() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Las contraseñas no coinciden.');
    if (password.length < 6) return setError('Mínimo 6 caracteres.');
    
    setError('');
    setLoading(true);
    
    try {
      const res = await completeFirstLogin({ identifier: state?.identifier, newPassword: password });
      if (res.token) {
        localStorage.setItem('token', res.token);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-slate-900 p-8 text-center relative">
           <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
             <ShieldCheck className="w-9 h-9 text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white">Configurar Acceso</h2>
           <p className="text-blue-100/80 text-sm mt-2">Bienvenido a Digital Signage</p>
        </div>

        <div className="p-8 space-y-6">
          <p className="text-sm text-gray-600 text-center bg-blue-50 p-3 rounded-lg border border-blue-100">
            Es tu primer inicio de sesión. Crea una contraseña segura para continuar.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Nueva Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="password" value={password} onChange={e => setPassword(e.target.value)} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">Confirmar</label>
              <div className="relative">
                <Check className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <input className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <button type="submit" disabled={loading} className={cn("w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition-all", loading && "opacity-75")}>
              {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Guardar y Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}