import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, LogIn } from 'lucide-react'; // Iconos para el cartel

import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import Dashboard from './pages/Dashboard';

import Pantallas from './pages/Pantallas';
import Eventos from './pages/Eventos';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import DashboardHome from './pages/DashboardHome';

// Componente para proteger rutas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ESTADO PARA EL CARTEL DE INACTIVIDAD
  const [sessionExpired, setSessionExpired] = useState(false);

  // ---------------------------------------------------------
  // 🕒 LÓGICA DE CIERRE DE SESIÓN POR INACTIVIDAD (2 Horas)
  // ---------------------------------------------------------
  useEffect(() => {
    // Si estamos en login o ya expiró la sesión, no hacemos nada
    if (location.pathname === '/login' || sessionExpired) return;

    // Configuración: 2 Horas
    const TIMEOUT_MS = 2 * 60 * 60 * 1000; 
    let timeoutId;

    const logout = () => {
      console.log("💤 [Inactividad] Tiempo cumplido.");
      
      // 1. Borramos credenciales (Seguridad primero)
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('savedIdentifier');

      // 2. EN LUGAR DE REDIRIGIR, MOSTRAMOS EL CARTEL
      setSessionExpired(true);
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, TIMEOUT_MS);
    };

    // Escuchar eventos
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    resetTimer();

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [navigate, location.pathname, sessionExpired]);

  // Función para ir al Login cuando el usuario haga clic en el cartel
  const handleLoginRedirect = () => {
    setSessionExpired(false);
    // Usamos href para forzar una recarga limpia
    window.location.href = '/manager/login';
  };

  return (
    <>
      {/* 🔴 CARTEL DE SESIÓN EXPIRADA (OVERLAY) */}
      {sessionExpired && (
        <div className="fixed inset-0 z-[9999] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
            
            <div className="w-20 h-20 bg-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <AlertTriangle size={40} />
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">Sesión Finalizada</h2>
            <p className="text-slate-400 mb-8">
              Tu sesión se ha cerrado automáticamente por inactividad para proteger tu cuenta.
            </p>
            
            <button 
              onClick={handleLoginRedirect}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/50"
            >
              <LogIn size={20} />
              Iniciar Sesión Nuevamente
            </button>
          </div>
        </div>
      )}

      {/* 🛣️ RUTAS NORMALES */}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/primer-login" element={<FirstLogin />} />
        
        <Route path="/" element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }>
          <Route index element={<DashboardHome />} />
          <Route path="pantallas" element={<Pantallas />} />
          <Route path="eventos" element={<Eventos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="configuracion" element={<Configuracion />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;