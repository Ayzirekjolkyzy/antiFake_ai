import { useEffect, useState } from 'react';
import { usersAPI } from '../../api/services';
import { Btn, toast, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, updateLocalUser } = useAuth();

  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  const [profileForm, setProfileForm] = useState({ username: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  const [pwForm, setPwForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [pwErrors, setPwErrors] = useState({});
  const [pwLoading, setPwLoading] = useState(false);

  const email = me?.email || user?.email || user?.sub || '';
  const username = me?.username || user?.username || '';
  const displayName = username || email.split('@')[0] || 'Пользователь';

  useEffect(() => {
    let mounted = true;

    usersAPI
      .getMe()
      .then((res) => {
        if (!mounted) return;

        const data = res.data || {};
        setMe(data);

        const name = data.username || data.name || '';
        setProfileForm({
          username: name || '',
        });

        updateLocalUser?.({
          username: name || '',
          email: data.email || user?.email || user?.sub || '',
        });
      })
      .catch(() => {
        const fallbackName = user?.username || '';
        setProfileForm({
          username: fallbackName,
        });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const validateProfile = () => {
    const e = {};
    const name = profileForm.username.trim();

    if (!name) e.username = 'Введите имя';
    else if (name.length < 5) e.username = 'Минимум 5 символов';
    else if (name.length > 50) e.username = 'Максимум 50 символов';

    setProfileErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();

    if (!validateProfile()) return;

    const username = profileForm.username.trim();

    setProfileLoading(true);

    try {
      await usersAPI.updateProfile({ username });

      setMe((prev) => ({
        ...prev,
        username,
      }));

      updateLocalUser?.({
        username,
      });

      toast.success('Профиль обновлён');
    } catch (err) {
      const msg = err.response?.data?.message || 'Ошибка при обновлении';
      toast.error(typeof msg === 'string' ? msg : 'Ошибка при обновлении');
    } finally {
      setProfileLoading(false);
    }
  };

  const validatePassword = () => {
    const e = {};

    if (!pwForm.currentPassword) {
      e.currentPassword = 'Введите текущий пароль';
    }

    if (!pwForm.newPassword) {
      e.newPassword = 'Введите новый пароль';
    } else if (pwForm.newPassword.length < 8) {
      e.newPassword = 'Минимум 8 символов';
    } else if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*\W)/.test(pwForm.newPassword)) {
      e.newPassword = 'Нужна заглавная буква, цифра и спецсимвол';
    }

    if (!pwForm.confirmNewPassword) {
      e.confirmNewPassword = 'Подтвердите новый пароль';
    } else if (pwForm.newPassword !== pwForm.confirmNewPassword) {
      e.confirmNewPassword = 'Пароли не совпадают';
    }

    setPwErrors(e);
    return Object.keys(e).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (!validatePassword()) return;

    setPwLoading(true);

    try {
      await usersAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
        confirmNewPassword: pwForm.confirmNewPassword,
      });

      toast.success('Пароль изменён');

      setPwForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (err) {
      const code = err.response?.data?.code;
      const msg = err.response?.data?.message;

      if (code === 'INVALID_CURRENT_PASSWORD') {
        toast.error('Неверный текущий пароль');
      } else if (code === 'CHANGE_PASSWORD_MISMATCH') {
        toast.error('Новый пароль не должен совпадать с текущим');
      } else {
        toast.error(typeof msg === 'string' ? msg : 'Ошибка при смене пароля');
      }
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <Skeleton height={80} radius={12} />
        <div style={{ height: 16 }} />
        <Skeleton height={220} radius={12} />
        <div style={{ height: 16 }} />
        <Skeleton height={300} radius={12} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em' }}>
          Профиль
        </h1>
        <p style={{ color: 'var(--text-3)', marginTop: 3, fontSize: '13px' }}>
          Управление аккаунтом
        </p>
      </div>

      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: 'var(--accent-subtle)',
            border: '2px solid rgba(43,138,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            fontWeight: 600,
            color: 'var(--accent)',
            flexShrink: 0,
          }}
        >
          {displayName[0]?.toUpperCase() || 'U'}
        </div>

        <div>
          <div style={{ fontWeight: 600, fontSize: '15px', marginBottom: 2 }}>
            {displayName}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            {email || '—'}
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
          marginBottom: 16,
        }}
      >
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 16, letterSpacing: '-0.01em' }}>
          Личные данные
        </h2>

        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Имя пользователя" error={profileErrors.username} hint="От 5 до 50 символов">
            <StyledInput
              type="text"
              value={profileForm.username}
              hasError={!!profileErrors.username}
              onChange={(e) => {
                setProfileForm((p) => ({
                  ...p,
                  username: e.target.value,
                }));
                setProfileErrors((p) => ({
                  ...p,
                  username: '',
                }));
              }}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn type="submit" loading={profileLoading}>
              Сохранить
            </Btn>
          </div>
        </form>
      </div>

      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '20px',
        }}
      >
        <h2 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 16, letterSpacing: '-0.01em' }}>
          Смена пароля
        </h2>

        <form onSubmit={handlePasswordChange} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <FormField label="Текущий пароль" error={pwErrors.currentPassword}>
            <StyledInput
              type="password"
              placeholder="••••••••"
              value={pwForm.currentPassword}
              hasError={!!pwErrors.currentPassword}
              onChange={(e) => {
                setPwForm((p) => ({
                  ...p,
                  currentPassword: e.target.value,
                }));
                setPwErrors((p) => ({
                  ...p,
                  currentPassword: '',
                }));
              }}
            />
          </FormField>

          <FormField
            label="Новый пароль"
            error={pwErrors.newPassword}
            hint="Минимум 8 символов: A-Z, a-z, 0-9, спецсимвол"
          >
            <StyledInput
              type="password"
              placeholder="••••••••"
              value={pwForm.newPassword}
              hasError={!!pwErrors.newPassword}
              onChange={(e) => {
                setPwForm((p) => ({
                  ...p,
                  newPassword: e.target.value,
                }));
                setPwErrors((p) => ({
                  ...p,
                  newPassword: '',
                }));
              }}
            />
          </FormField>

          <FormField label="Подтвердите новый пароль" error={pwErrors.confirmNewPassword}>
            <StyledInput
              type="password"
              placeholder="••••••••"
              value={pwForm.confirmNewPassword}
              hasError={!!pwErrors.confirmNewPassword}
              onChange={(e) => {
                setPwForm((p) => ({
                  ...p,
                  confirmNewPassword: e.target.value,
                }));
                setPwErrors((p) => ({
                  ...p,
                  confirmNewPassword: '',
                }));
              }}
            />
          </FormField>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Btn type="submit" loading={pwLoading} variant="secondary">
              Сменить пароль
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormField({ label, error, hint, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
      <label style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-2)' }}>
        {label}
      </label>

      {children}

      {error && (
        <span style={{ fontSize: '11.5px', color: 'var(--red)' }}>
          {error}
        </span>
      )}

      {hint && !error && (
        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>
          {hint}
        </span>
      )}
    </div>
  );
}

function StyledInput({ hasError, ...props }) {
  const [focused, setFocused] = useState(false);

  return (
    <input
      style={{
        width: '100%',
        background: 'var(--bg-3)',
        border: `1px solid ${
          hasError
            ? 'var(--red-border)'
            : focused
              ? 'var(--border-active)'
              : 'var(--border)'
        }`,
        borderRadius: 'var(--radius)',
        padding: '9px 13px',
        color: 'var(--text)',
        fontSize: '14px',
        outline: 'none',
        fontFamily: 'var(--font)',
        letterSpacing: '-0.01em',
        transition: 'border-color var(--transition), box-shadow var(--transition)',
        boxShadow: focused
          ? '0 0 0 3px var(--accent-subtle)'
          : hasError
            ? '0 0 0 3px rgba(240,69,90,0.08)'
            : 'none',
      }}
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}