import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import Dashboard from './pages/Dashboard';

import Pantallas from './pages/Pantallas';
import Eventos from './pages/Eventos';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import DashboardHome from './pages/DashboardHome';

// --- DEBUG: Componente para detectar ruta 404 ---
const RutaNoEncontrada = () => {
  console.error("⚠️ [App] Cayó en ruta desconocida (*). Redirigiendo a Login.");
  return <Navigate to="/login" replace />;
};

// --- DEBUG: PrivateRoute con logs ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  console.log(`🔒 [PrivateRoute] Revisando acceso. Token: ${token ? 'SI existe' : 'NO existe'}`);
  
  if (!token) {
    console.warn("⛔ [PrivateRoute] Acceso denegado. No hay token.");
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // DEBUG: Ver en qué ruta cree React que estamos
  useEffect(() => {
    console.log("📍 [Router] Ruta actual:", location.pathname);
  }, [location]);

  // 🕒 LÓGICA DE CIERRE DE SESIÓN POR INACTIVIDAD (2 Horas)
  useEffect(() => {
    if (location.pathname === '/login') return;

    const TIMEOUT_MS = 2 * 60 * 60 * 1000; 
    let timeoutId;

    const logout = () => {
      console.log("💤 [Inactividad] Cerrando sesión...");
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      navigate('/login?msg=inactivity');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, TIMEOUT_MS);
    };

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
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/primer-login" element={<FirstLogin />} />
      
      {/* RUTAS PRIVADAS */}
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
      
      {/* RUTA COMODÍN (Catch-all) */}
      <Route path="*" element={<RutaNoEncontrada />} />
    </Routes>
  );
}

export default App;