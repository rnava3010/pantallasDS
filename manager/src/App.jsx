import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import FirstLogin from './pages/FirstLogin';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Routes>
      {/* Público */}
      <Route path="/login" element={<Login />} />
      <Route path="/primer-login" element={<FirstLogin />} />

      {/* Privado (simple): si no hay token, manda a login */}
      <Route
        path="/"
        element={token ? <Dashboard /> : <Navigate to="/login" replace />}
      />

      {/* 404 */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;