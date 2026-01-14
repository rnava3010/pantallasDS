import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom'; // USAMOS useSearchParams
import apiClient from '../services/apiClient';
import { User, Lock, Loader2, AlertTriangle } from 'lucide-react'; // Agregué icono de alerta
import { cn } from '../utils/cn';

import logoNarabyte from '../assets/narabyte.png'; 

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  
  // HOOK ESPECIAL PARA LEER PARAMETROS (?msg=...)
  const [searchParams, setSearchParams] = useSearchParams();

  // ---------------------------------------------------------
  // 1. EFECTO INICIAL
  // ---------------------------------------------------------
  useEffect(() => {
    // A) Lógica "Recuérdame"
    const savedUser = localStorage.getItem('savedIdentifier');
    if (savedUser) {
      setIdentifier(savedUser);
      setRememberMe(true);
    }

    // B) Lógica de Mensajes (CON LOGS PARA DEPURAR)
    const msg = searchParams.get('msg');
    console.log("🔍 Revisando URL... Parametro msg:", msg); // <--- MIRA LA CONSOLA (F12)

    if (msg) {
        if (msg === 'session') {
            setError('⚠️ Tu sesión ha caducado. Ingresa nuevamente.');
        } else if (msg === 'inactivity') {
            setError('💤 Sesión cerrada por inactividad.');
        } else if (msg === 'network') {
            setError('📡 Error de conexión. Verifica tu internet.');
        } else {
            setError('⚠️ ' + msg); // Por si mandamos otro mensaje personalizado
        }

        // Limpiamos la URL usando el método de React Router para evitar recargas
        setSearchParams({}); 
    }
  }, []); // Array vacío para que corra solo al montar

  // ---------------------------------------------------------
  // 2. ENVÍO DEL FORMULARIO
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiClient.post('/manager/auth/login', { 
        identifier, 
        password 
      });
      
      const data = response.data;
      
      if (data.requirePasswordSetup) {
        navigate('/primer-login', { state: { identifier } });
        return;
      }
      
      if (data.token) {
        if (rememberMe) {
          localStorage.setItem('savedIdentifier', identifier);
        } else {
          localStorage.removeItem('savedIdentifier');
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || 'Credenciales incorrectas o usuario inactivo.';
      setError(msg);
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
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <img 
              src={logoNarabyte} 
              alt="Narabyte Logo" 
              className="h-24 w-auto object-contain drop-shadow-lg" 
            />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Digital Signage</h1>
          <p className="text-slate-400 mt-2 text-sm">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Usuario</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Correo o ID"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-300 uppercase tracking-wider ml-1">Contraseña</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 cursor-pointer accent-blue-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300 cursor-pointer select-none">
                Recuérdame
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-blue-400 hover:text-blue-300">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          {/* --- CAJA DE ERROR VISIBLE --- */}
          {error && (
            <div className="mb-4 p-4 rounded-lg bg-red-600 border-2 border-red-400 text-white text-sm flex items-center gap-3 shadow-xl animate-bounce-short">
              <AlertTriangle className="h-6 w-6 shrink-0 text-white" />
              <span className="font-bold">{error}</span>
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
            {loading ? <Loader2 className="animate-spin inline mr-2 h-4 w-4" /> : 'Ingresar'}
          </button>
        </form>
        
        <div className="mt-8 text-center border-t border-white/5 pt-4">
           <p className="text-xs text-slate-500">Powered by Narabyte</p>
        </div>

      </div>
    </div>
  );
}