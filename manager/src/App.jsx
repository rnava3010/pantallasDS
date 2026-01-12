import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';

function App() {
  return (
    <Routes>
      {/* Público */}
      <Route path="/login" element={<Login />} />
      <Route path="/primer-login" element={<FirstLogin />} />

      {/* Privado (ejemplo; agrega un guard cuando tengas auth) */}
      <Route path="/" element={<Dashboard />} />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;