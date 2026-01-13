import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { completeFirstLogin } from '../services/authService';
import { Lock, ShieldCheck, Loader2, Check, AlertTriangle } from 'lucide-react';
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
    
    // --- VALIDACIONES DE SEGURIDAD ---
    if (password !== confirm) {
      return setError('Las contraseñas no coinciden.');
    }
    if (password.length < 8) {
      return setError('Mínimo 8 caracteres.');
    }
    const tieneLetras = /[a-zA-Z]/.test(password);
    const tieneNumeros = /\d/.test(password);
    if (!tieneLetras || !tieneNumeros) {
      return setError('La contraseña debe tener letras y números.');
    }
    // --------------------------------
    
    setError('');
    setLoading(true);
    
    try {
      const res = await completeFirstLogin({
        identifier: state?.identifier,
        newPassword: password,
      });
      
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
    <div className="min-h-screen flex items-center justify-center bg-slate-900 relative overflow-hidden font-sans">
      
      {/* Fondo Decorativo (Igual que el Login) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 mx-4">
        
        {/* Cabecera */}
        <div className="text-center mb-8">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 mb-4 shadow-lg shadow-blue-500/30">
             <ShieldCheck className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Seguridad de Cuenta</h2>
           <p className="text-slate-400 text-sm mt-2">Configura tu acceso personal</p>
        </div>

        {/* Mensaje Informativo */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 flex gap-3 items-start">
            <AlertTriangle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-200 leading-relaxed">
              Nueva política de seguridad: Tu contraseña debe tener al menos <strong>8 caracteres</strong> e incluir <strong>letras y números</strong>.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Nueva Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Confirmar</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Check className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la contraseña"
              />
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full shrink-0"></span>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transition-all",
              loading && "opacity-70 cursor-wait"
            )}
          >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : 'Guardar y Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}