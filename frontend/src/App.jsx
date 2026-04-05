// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PrivateRoute, AdminRoute } from './components/PrivateRoute';

import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas privadas (qualquer usuário logado) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>

          {/* Rotas de admin */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<Admin />} />
          </Route>

          {/* Redireciona raiz para registro */}
          <Route path="/" element={<Navigate to="/register" replace />} />
          <Route path="*" element={<Navigate to="/register" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
