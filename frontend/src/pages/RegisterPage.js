import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/services';
import { toast } from '../components/ui';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);

  const handleChange = (e) => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };
    const getRegisterErrorMessage = (data) => {

    // BusinessException
    if (data?.code) {

        const businessErrors = {
        EMAIL_ALREADY_EXISTS:
            'Этот email уже зарегистрирован.',

        PASSWORD_MISMATCH:
            'Пароли не совпадают.',
        };

        return businessErrors[data.code] || data.message || 'Ошибка регистрации';
    }

    // Validation errors
    const validationError = data?.validationErrors?.[0];

    const validationCode =
        validationError?.code ||
        validationError?.message ||
        '';

    const validationMessages = {

        // USERNAME
        'VALIDATION.REGISTRATION.USERNAME.NOT_BLANK':
            'Введите имя.',

        'VALIDATION.REGISTRATION.USERNAME.SIZE':
            'Имя должно содержать от 5 до 50 символов.',

        'VALIDATION.REGISTRATION.USERNAME.PATTERN':
            'Имя может содержать только буквы, пробелы, апострофы и дефисы.',


        // EMAIL
        'VALIDATION.REGISTRATION.EMAIL.NOT_BLANK':
            'Введите адрес электронной почты.',

        'VALIDATION.REGISTRATION.EMAIL.FORMAT':
            'Введите корректный адрес электронной почты.',

        'VALIDATION.REGISTRATION.EMAIL.DISPOSABLE':
            'Временные адреса электронной почты запрещены.',


        // PASSWORD
        'VALIDATION.REGISTRATION.PASSWORD.NOT_BLANK':
            'Введите пароль.',

        'VALIDATION.REGISTRATION.PASSWORD.SIZE':
            'Пароль должен содержать от 8 до 50 символов.',

        'VALIDATION.REGISTRATION.PASSWORD.WEAK':
            'Пароль должен содержать заглавную букву, строчную букву, цифру и спецсимвол.',


        // CONFIRM PASSWORD
        'VALIDATION.REGISTRATION.CONFIRM_PASSWORD.NOT_BLANK':
            'Подтвердите пароль.',

        'VALIDATION.REGISTRATION.CONFIRM_PASSWORD.SIZE':
            'Подтверждение пароля должно содержать от 8 до 50 символов.',
    };

    return (
        validationMessages[validationCode] ||
        validationError?.message ||
        'Ошибка регистрации'
    );
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    // password match validation
    if (form.password !== form.confirmPassword) {
        toast.error('Пароли не совпадают');
        setLoading(false);
        return;
    }

    try {

        await authAPI.register(form);

        toast.success('Аккаунт успешно создан');

        navigate('/login');

    } catch (err) {
  toast.error(
    getRegisterErrorMessage(err?.response?.data)
  );
}
   finally {

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
      <div style={{ width: '100%', maxWidth: 420 }}>
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
            Создать аккаунт
          </h1>

          <p style={{
            color: 'var(--text-3)',
            marginTop: 4,
            fontSize: 12.5,
            fontFamily: 'var(--mono)',
          }}>
            Регистрация пользователя
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
                Имя
              </label>
                <input
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                placeholder="Введите имя"
                style={inputStyle('username')}
                onFocus={() => setFocused('username')}
                onBlur={() => setFocused(null)}
            />
            </div>

            {/* <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Фамилия
              </label>
              <input
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Введите фамилию"
                style={inputStyle('lastName')}
                onFocus={() => setFocused('lastName')}
                onBlur={() => setFocused(null)}
              />
            </div> */}

            <div>
              <label style={{ fontSize: 12, color: 'var(--text-2)' }}>
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="user@gmail.com"
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
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
                placeholder="••••••••"
                style={inputStyle('password')}
                onFocus={() => setFocused('password')}
                onBlur={() => setFocused(null)}
              />
            </div>
                <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    Подтвердите пароль
                </label>

                <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    style={inputStyle('confirmPassword')}
                    onFocus={() => setFocused('confirmPassword')}
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
              {loading ? 'Создание...' : 'Зарегистрироваться'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12 }}>
            Уже есть аккаунт?{' '}
            <span
              onClick={() => navigate('/login')}
              style={{ color: 'var(--accent)', cursor: 'pointer' }}
            >
              Войти
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}