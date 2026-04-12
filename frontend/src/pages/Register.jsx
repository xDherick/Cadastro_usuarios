// src/pages/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Nome deve ter ao menos 2 caracteres.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'E-mail inválido.';
    if (form.password.length < 8) e.password = 'Senha deve ter ao menos 8 caracteres.';
    if (form.password !== form.confirm) e.confirm = 'As senhas não coincidem.';
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
      await register(form.name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao cadastrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-6 font-sans">
      <div className="card w-full max-w-md p-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-xl mb-4">
            US
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Criar conta</h1>
          <p className="text-sm text-slate-500">Preencha os dados abaixo para se cadastrar</p>
        </div>

        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Nome completo" name="name" type="text" value={form.name} onChange={handleChange} error={errors.name} placeholder="Seu nome" />
          <Field label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} placeholder="seu@email.com" />
          <Field label="Senha" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} placeholder="Mínimo 8 caracteres" />
          <Field label="Confirmar senha" name="confirm" type="password" value={form.confirm} onChange={handleChange} error={errors.confirm} placeholder="Repita a senha" />

          <button type="submit" disabled={loading} className="btn-primary mt-1">
            {loading ? 'Cadastrando...' : 'Criar conta'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-slate-500">
          Já tem conta?{' '}
          <Link to="/login" className="text-brand-600 font-semibold hover:underline">Entrar</Link>
        </p>
      </div>
    </div>
  );
}

function Field({ label, name, type, value, onChange, error, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      <input
        name={name} type={type} value={value} onChange={onChange} placeholder={placeholder}
        autoComplete={type === 'password' ? 'new-password' : undefined}
        className={`input-field ${error ? 'input-error' : ''}`}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
