import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { User, Lock, Loader2 } from 'lucide-react';
import { cn } from '../utils/cn';

import logoNarabyte from '../assets/narabyte.png'; 

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); // Hook para leer la URL

  // ---------------------------------------------------------
  // 1. EFECTO INICIAL: Cargar usuario y Leer mensajes de error
  // ---------------------------------------------------------
  useEffect(() => {
    // A) Lógica "Recuérdame"
    const savedUser = localStorage.getItem('savedIdentifier');
    if (savedUser) {
      setIdentifier(savedUser);
      setRememberMe(true);
    }

    // B) Lógica de Mensajes de Error (Inactividad / Sesión)
    const params = new URLSearchParams(location.search);
    const msg = params.get('msg');

    if (msg === 'session') {
      setError('⚠️ Tu sesión ha caducado. Por favor, ingresa nuevamente.');
    } else if (msg === 'inactivity') {
      setError('💤 Sesión cerrada por inactividad.');
    } else if (msg === 'network') {
      setError('📡 Error de conexión. Verifica tu internet.');
    }

    // Limpiar la URL para que el mensaje no persista si recargas
    if (msg) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [location]);

  // ---------------------------------------------------------
  // 2. ENVÍO DEL FORMULARIO
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Usamos apiClient directo
      const response = await apiClient.post('/manager/auth/login', { 
        identifier, 
        password 
      });
      
      const data = response.data;
      
      // Caso 1: Primer Login (Requiere cambio de pass)
      if (data.requirePasswordSetup) {
        navigate('/primer-login', { state: { identifier } });
        return;
      }
      
      // Caso 2: Login Exitoso
      if (data.token) {
        // Guardar o borrar preferencia de "Recuérdame"
        if (rememberMe) {
          localStorage.setItem('savedIdentifier', identifier);
        } else {
          localStorage.removeItem('savedIdentifier');
        }

        // Guardar Sesión
        localStorage.setItem('token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        // Redirigir al Dashboard
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      // Si el backend manda un mensaje específico, úsalo, si no, usa el genérico
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

          {/* CHECKBOX RECUÉRDAME */}
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

		{error && (
		  <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500 text-red-100 text-sm text-center font-bold shadow-lg">
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