// src/pages/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.';
    if (!form.password) e.password = 'Senha é obrigatória.';
    return e;
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      navigate(user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Credenciais inválidas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-6 font-sans">
      <div className="card w-full max-w-sm p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-xl mb-4">
            US
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Entrar</h1>
          <p className="text-sm text-slate-500">Acesse sua conta</p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">E-mail</label>
            <input
              name="email" type="email" value={form.email} onChange={handleChange}
              placeholder="seu@email.com" autoComplete="email"
              className={`input-field ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Senha</label>
            <input
              name="password" type="password" value={form.password} onChange={handleChange}
              placeholder="Sua senha" autoComplete="current-password"
              className={`input-field ${errors.password ? 'input-error' : ''}`}
            />
            {errors.password && <span className="text-xs text-red-500">{errors.password}</span>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          <Link to="/forgot-password" className="text-slate-500 text-sm hover:underline block text-center mb-4">Esqueci minha senha</Link>
        Não tem conta?{' '}
          <Link to="/register" className="text-brand-600 font-semibold hover:underline">Cadastre-se</Link>
        </p>
      </div>
    </div>
  );
}
