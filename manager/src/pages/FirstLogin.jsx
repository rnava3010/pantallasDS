import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { completeFirstLogin } from '../services/authService';
import { Lock, ShieldCheck, Loader2, Check, AlertTriangle, XCircle, CheckCircle } from 'lucide-react';
import { cn } from '../utils/cn';

export default function FirstLogin() {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password === confirm && password.length > 0;
  const isLengthValid = password.length >= 8;
  const isComplexityValid = /[a-zA-Z]/.test(password) && /\d/.test(password);
  
  const isFormValid = passwordsMatch && isLengthValid && isComplexityValid;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

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
      
      {/* Fondo Decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 -right-10 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 mx-4">
        
        <div className="text-center mb-6">
           <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-500 mb-4 shadow-lg shadow-blue-500/30">
             <ShieldCheck className="w-8 h-8 text-white" />
           </div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Seguridad de Cuenta</h2>
           <p className="text-slate-400 text-sm mt-2">Configura tu acceso personal</p>
        </div>

        {/* Lista de requisitos en tiempo real */}
        <div className="mb-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700 space-y-2">
            <p className="text-xs text-slate-400 font-semibold mb-2 uppercase tracking-wider">Requisitos:</p>
            
            <ValidationItem valid={isLengthValid} text="Mínimo 8 caracteres" />
            <ValidationItem valid={isComplexityValid} text="Incluye letras y números" />
            <ValidationItem valid={passwordsMatch} text="Las contraseñas coinciden" />
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
                placeholder="Ingresa tu nueva clave"
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
                className={cn(
                    "block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 transition-all",
                    // Borde rojo si escribieron algo y NO coinciden
                    confirm && !passwordsMatch ? "border-red-500 focus:ring-red-500" : "focus:ring-blue-500"
                )}
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite la clave"
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
            disabled={loading || !isFormValid}
            className={cn(
              "w-full py-3 px-4 rounded-lg shadow-lg text-sm font-bold text-white transition-all",
              // Estilos visuales para habilitado vs deshabilitado
              isFormValid 
                ? "bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 transform active:scale-95" 
                : "bg-slate-700 text-slate-400 cursor-not-allowed opacity-50",
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

function ValidationItem({ valid, text }) {
    return (
        <div className="flex items-center gap-2 text-xs transition-colors duration-300">
            {valid ? (
                <CheckCircle className="w-4 h-4 text-emerald-400" />
            ) : (
                <div className="w-4 h-4 rounded-full border border-slate-600 bg-slate-800" />
            )}
            <span className={valid ? "text-emerald-100" : "text-slate-500"}>{text}</span>
        </div>
    );
}