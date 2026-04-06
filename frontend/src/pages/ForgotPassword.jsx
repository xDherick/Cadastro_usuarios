import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function ForgotPassword() {
  const [email, setEmail]       = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Informe um e-mail válido.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch {
      // Mesmo em erro de rede mostramos a mensagem genérica (não vaza info)
      setSuccess(true);
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Esqueci minha senha</h1>
          <p className="text-sm text-slate-500">
            Informe seu e-mail e enviaremos um link para redefinir sua senha.
          </p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4">📬</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Verifique seu e-mail</h2>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">
              Se este e-mail estiver cadastrado, você receberá as instruções em instantes.
              O link expira em <strong>15 minutos</strong>.
            </p>
            <Link to="/login" className="text-brand-600 text-sm font-semibold hover:underline">
              ← Voltar para o login
            </Link>
          </div>
        ) : (
          <>
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">E-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  placeholder="seu@email.com"
                  autoComplete="email"
                  className={`input-field ${error ? 'input-error' : ''}`}
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-1">
                {loading ? 'Enviando...' : 'Enviar link de recuperação'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500">
              Lembrou a senha?{' '}
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                Entrar
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
