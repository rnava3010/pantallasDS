import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Quitamos useSearchParams para usar Vanilla JS
import apiClient from '../services/apiClient';
import { User, Lock, Loader2, AlertTriangle, XCircle } from 'lucide-react'; // Iconos nuevos
import { cn } from '../utils/cn';

import logoNarabyte from '../assets/narabyte.png'; 

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // ---------------------------------------------------------
  // 1. EFECTO INICIAL (Lectura de URL y Usuario Guardado)
  // ---------------------------------------------------------
  useEffect(() => {
    // A) Recuérdame
    const savedUser = localStorage.getItem('savedIdentifier');
    if (savedUser) {
      setIdentifier(savedUser);
      setRememberMe(true);
    }

    // B) Leer URL manualmente (Más robusto)
    const params = new URLSearchParams(window.location.search);
    const msg = params.get('msg');
    
    console.log("🔍 [Login] Iniciando. Mensaje en URL:", msg);

    if (msg) {
        if (msg === 'session') setError('⚠️ Tu sesión ha caducado. Ingresa nuevamente.');
        else if (msg === 'inactivity') setError('💤 Sesión cerrada por inactividad.');
        else if (msg === 'network') setError('📡 Error de conexión. Verifica tu internet.');
        else setError(msg);

        // Limpiar URL sin recargar (para que se vea limpio)
        //const newUrl = window.location.pathname;
        //window.history.replaceState({}, '', newUrl);
    }
  }, []);

  // ---------------------------------------------------------
  // 2. ENVÍO DEL FORMULARIO
  // ---------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Limpiamos errores previos
    setLoading(true);

    console.log("🔵 [Login] Intentando ingresar con:", identifier);

    try {
      const response = await apiClient.post('/manager/auth/login', { 
        identifier, 
        password 
      });
      
      console.log("🟢 [Login] Respuesta exitosa:", response.data);
      const data = response.data;
      
      if (data.requirePasswordSetup) {
        navigate('/primer-login', { state: { identifier } });
        return;
      }
      
      if (data.token) {
        if (rememberMe) localStorage.setItem('savedIdentifier', identifier);
        else localStorage.removeItem('savedIdentifier');

        localStorage.setItem('token', data.token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
        
        navigate('/');
      }

    } catch (err) {
      console.error("🔴 [Login] Error atrapado:", err); // <--- BUSCA ESTO EN CONSOLA
      
      // Texto por defecto si falla la conexión
      let mensajeFinal = 'No se pudo conectar con el servidor.';

      if (err.response) {
        // El servidor respondió con error (ej. 401 Credenciales inválidas)
        mensajeFinal = err.response.data?.message || 'Error de acceso.';
      } else if (err.request) {
        // La petición salió pero no hubo respuesta (Red caída)
        mensajeFinal = 'Error de red. Verifica tu conexión.';
      }

      setError(mensajeFinal); // <--- ESTO DEBERÍA MOSTRAR LA CAJA ROJA
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
            <img src={logoNarabyte} alt="Logo" className="h-24 w-auto object-contain drop-shadow-lg" />
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
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500 accent-blue-600"
              />
              <span className="ml-2 text-sm text-slate-300">Recuérdame</span>
            </label>
            <a href="#" className="text-sm font-medium text-blue-400 hover:text-blue-300">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          {/* --- CAJA DE ERROR (Mejorada y Forzada) --- */}
          {error && (
            <div 
              className="mb-4 p-4 rounded-lg bg-red-600 text-white text-sm flex items-center gap-3 shadow-xl animate-pulse"
              style={{ display: 'flex', border: '2px solid #fca5a5' }} 
            >
              <AlertTriangle className="h-6 w-6 shrink-0 text-white" />
              <div className="flex-1 font-bold">
                {error}
              </div>
              <button type="button" onClick={() => setError('')} className="text-white/70 hover:text-white">
                <XCircle size={18} />
              </button>
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