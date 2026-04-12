// src/pages/ResetPassword.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [tokenValid, setTokenValid]       = useState(null); // null = verificando
  const [newPassword, setNewPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors]               = useState({});
  const [apiError, setApiError]           = useState('');
  const [success, setSuccess]             = useState(false);
  const [loading, setLoading]             = useState(false);

  // Valida o token assim que a página abre
  useEffect(() => {
    if (!token) { setTokenValid(false); return; }

    api.get(`/auth/validate-reset-token?token=${token}`)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const validate = () => {
    const e = {};
    if (newPassword.length < 8) e.newPassword = 'Senha deve ter ao menos 8 caracteres.';
    if (newPassword !== confirmPassword) e.confirmPassword = 'As senhas não coincidem.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setErrors({});
    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setSuccess(true);
      // Redireciona para login após 3 segundos
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Erro ao redefinir senha.');
    } finally {
      setLoading(false);
    }
  };

  // Verificando token
  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900">
        <p className="text-white text-sm">Verificando link...</p>
      </div>
    );
  }

  // Token inválido ou expirado
  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-6 font-sans">
        <div className="card w-full max-w-sm p-10 text-center">
          <div className="text-4xl mb-4">⏰</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Link inválido ou expirado</h1>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            Este link de redefinição não é mais válido. Solicite um novo link.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block w-full py-3 rounded-xl bg-gradient-to-r from-brand-600 to-brand-700 text-white font-semibold text-sm text-center hover:opacity-90 transition-opacity"
          >
            Solicitar novo link
          </Link>
          <p className="mt-4 text-sm">
            <Link to="/login" className="text-brand-600 font-semibold hover:underline">← Voltar para o login</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-blue-900 p-6 font-sans">
      <div className="card w-full max-w-sm p-10">

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-brand-700 text-white font-bold text-xl mb-4">
            US
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Nova senha</h1>
          <p className="text-sm text-slate-500">Escolha uma senha forte com ao menos 8 caracteres.</p>
        </div>

        {success ? (
          <div className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <h2 className="text-lg font-semibold text-slate-900 mb-2">Senha redefinida!</h2>
            <p className="text-sm text-slate-500 mb-1">Redirecionando para o login...</p>
            <Link to="/login" className="text-brand-600 text-sm font-semibold hover:underline">
              Ir agora →
            </Link>
          </div>
        ) : (
          <>
            {apiError && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 mb-5">
                {apiError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Nova senha</label>
                <input
                  type="password" value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setErrors((p) => ({ ...p, newPassword: '' })); }}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  className={`input-field ${errors.newPassword ? 'input-error' : ''}`}
                />
                {errors.newPassword && <span className="text-xs text-red-500">{errors.newPassword}</span>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Confirmar nova senha</label>
                <input
                  type="password" value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => ({ ...p, confirmPassword: '' })); }}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  className={`input-field ${errors.confirmPassword ? 'input-error' : ''}`}
                />
                {errors.confirmPassword && <span className="text-xs text-red-500">{errors.confirmPassword}</span>}
              </div>

              <button type="submit" disabled={loading} className="btn-primary mt-1">
                {loading ? 'Salvando...' : 'Redefinir senha'}
              </button>
            </form>

            <p className="text-center mt-6 text-sm text-slate-500">
              <Link to="/login" className="text-brand-600 font-semibold hover:underline">
                ← Voltar para o login
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
