import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from '../components/ui';

export default function LoginPage({ mode = 'user' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  const isAdminLogin = mode === 'admin';

  const getRole = (user) =>
    user?.role ||
    user?.roles?.[0] ||
    user?.authorities?.[0]?.authority ||
    user?.authorities?.[0];

  const getLoginErrorMessage = (data) => {

    const code =
      data?.code ||
      data?.message ||
      '';

    const messages = {

      BAD_CREDENTIALS:
        'Неверный email или пароль.',

      USERNAME_NOT_FOUND:
        'Пользователь не найден.',

      ERR_USER_DISABLED:
        'Аккаунт отключён.',

      INTERNAL_EXCEPTION:
        'Ошибка сервера. Попробуйте позже.',
    };

    return messages[code] || data?.message || 'Ошибка авторизации';
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = await login(email, password);
      const role = getRole(user);

      if (isAdminLogin && role !== 'ADMIN' && role !== 'ROLE_ADMIN') {
        toast.error('У вас нет прав администратора');
        return;
      }

      if (role === 'ADMIN' || role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(getLoginErrorMessage(err?.response?.data));
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (name) => ({
    width: '100%',
    background: 'var(--bg-3)',
    border: `1px solid ${focused === name ? 'var(--border-active)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    padding: '9px 13px',
    color: 'var(--text)',
    fontSize: '13.5px',
    outline: 'none',
    fontFamily: 'var(--font)',
    boxShadow: focused === name ? '0 0 0 3px var(--accent-subtle)' : 'none',
  });

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg)',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #2b8aff 0%, #1a5cbf 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            fontWeight: 700,
            color: '#fff',
            margin: '0 auto 14px',
          }}>
            A
          </div>

          <h1 style={{ fontSize: 18, fontWeight: 600 }}>
            AntifakeAI
          </h1>

          <p style={{
            color: 'var(--text-3)',
            marginTop: 4,
            fontSize: 12.5,
            fontFamily: 'var(--mono)',
          }}>
            {isAdminLogin ? 'Вход для администратора' : 'Вход в аккаунт'}
          </p>
        </div>

        <div style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          padding: '28px 24px',
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder={isAdminLogin ? 'admin@gmail.com' : 'user@gmail.com'}
                style={inputStyle('email')}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Пароль
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={inputStyle('password')}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 0',
                background: loading ? 'var(--bg-4)' : 'var(--accent)',
                color: '#fff',
                border: 'none',
                borderRadius: 'var(--radius)',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: 13.5,
                fontWeight: 500,
              }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>

          {!isAdminLogin && (
            <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
              Нет аккаунта?{' '}
              <span
                onClick={() => navigate('/register')}
                style={{ color: 'var(--accent)', cursor: 'pointer' }}
              >
                Зарегистрироваться
              </span>
            </p>
          )}

          {!isAdminLogin && (
            <button
              type="button"
              onClick={() => navigate('/admin-login')}
              style={{
                width: '100%',
                marginTop: 12,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Войти как администратор
            </button>
          )}

          {isAdminLogin && (
            <button
              type="button"
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                marginTop: 12,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-3)',
                cursor: 'pointer',
                fontSize: 12,
              }}
            >
              Вернуться к входу пользователя
            </button>
          )}
        </div>
      </div>
    </div>
  );
}