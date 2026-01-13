// manager/src/App.jsx
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';
import Dashboard from './pages/Dashboard';

// Importa tus nuevas páginas
import Pantallas from './pages/Pantallas';
import Eventos from './pages/Eventos';

// Componente para proteger rutas privadas
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/primer-login" element={<FirstLogin />} />
      
      {/* RUTAS PRIVADAS (LAYOUT DASHBOARD) */}
      <Route path="/" element={
        <PrivateRoute>
          {/* El Dashboard actúa como contenedor (tiene el Sidebar fijo) */}
          <Dashboard />
        </PrivateRoute>
      }>
        {/* Aquí definimos las "Sub-rutas" que se cargan EN EL OUTLET del Dashboard */}
        
        {/* Ruta index: Lo que se ve al entrar a "/" (Home) */}
        <Route index element={<h1 className="text-white text-2xl">Bienvenido al Inicio</h1>} />
        
        {/* Rutas del Menú de BD */}
        <Route path="pantallas" element={<Pantallas />} />
        <Route path="eventos" element={<Eventos />} />
        
        {/* Si agregas más botones en la BD (ej. /usuarios), agrega su Route aquí */}
        {/* <Route path="usuarios" element={<Usuarios />} /> */}
      </Route>
      
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;