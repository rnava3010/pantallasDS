import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import Dashboard from './pages/Dashboard';

// Importa tus páginas
import Pantallas from './pages/Pantallas';
import Eventos from './pages/Eventos';
import Usuarios from './pages/Usuarios';
import Configuracion from './pages/Configuracion';
import DashboardHome from './pages/DashboardHome';

// Componente para proteger rutas (si no hay token, manda al login)
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // ---------------------------------------------------------
  // 🕒 LÓGICA DE CIERRE DE SESIÓN POR INACTIVIDAD (30 MIN)
  // ---------------------------------------------------------
  useEffect(() => {
    // Si ya estamos en login, no hacer nada
    if (location.pathname === '/login') return;

    // Configuración: 30 minutos (en milisegundos)
    const TIMEOUT_MS = 30 * 60 * 1000; 
    let timeoutId;

    const logout = () => {
      console.log("Sesión expirada por inactividad");
      localStorage.removeItem('token');
      localStorage.removeItem('user_data');
      navigate('/login');
    };

    const resetTimer = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(logout, TIMEOUT_MS);
    };

    // Escuchar cualquier movimiento o tecla para reiniciar el contador
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keypress', resetTimer);
    window.addEventListener('click', resetTimer);
    window.addEventListener('scroll', resetTimer);

    // Iniciar el timer al cargar
    resetTimer();

    // Limpieza al desmontar (para no dejar eventos colgados)
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keypress', resetTimer);
      window.removeEventListener('click', resetTimer);
      window.removeEventListener('scroll', resetTimer);
    };
  }, [navigate, location.pathname]);


  // ---------------------------------------------------------
  // 🛣️ DEFINICIÓN DE RUTAS
  // ---------------------------------------------------------
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/primer-login" element={<FirstLogin />} />
      
      {/* RUTAS PRIVADAS (LAYOUT DASHBOARD) */}
      <Route path="/" element={
        <PrivateRoute>
          {/* El Dashboard actúa como contenedor (Sidebar + Header + Outlet) */}
          <Dashboard />
        </PrivateRoute>
      }>
        
        {/* Ruta index: Lo que se ve al entrar a "/" (Tu nuevo DashboardHome) */}
        <Route index element={<DashboardHome />} />
        
        {/* Rutas del Menú de BD */}
        <Route path="pantallas" element={<Pantallas />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="configuracion" element={<Configuracion />} />
        
      </Route>
      
      {/* Cualquier ruta desconocida manda al login */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;