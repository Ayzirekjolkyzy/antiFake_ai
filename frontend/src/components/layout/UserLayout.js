import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Home,
  Package,
  Search,
  History,
  User,
  LogOut,
  Sparkles,
  LogIn,
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/', icon: Home, label: 'Главная', exact: true, public: true },
  { to: '/products', icon: Package, label: 'Продукты', public: true },
  { to: '/verify', icon: Search, label: 'Проверка', protected: true },
  { to: '/history', icon: History, label: 'История', protected: true },
  { to: '/profile', icon: User, label: 'Профиль', protected: true },
];

export default function UserLayout() {
  const { logout, isAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <aside
        style={{
          width: 'var(--sidebar-w)',
          flexShrink: 0,
          background: 'linear-gradient(180deg, var(--bg-2), var(--bg))',
          borderRight: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 16px 16px',
            borderBottom: '1px solid var(--border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 11,
                background: 'linear-gradient(135deg,#2b8aff,#1a5cbf)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 8px 22px rgba(43,138,255,0.28)',
              }}
            >
              <Sparkles size={18} strokeWidth={2.4} />
            </div>

            <div>
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '14px',
                  color: 'var(--text)',
                  letterSpacing: '-0.02em',
                }}
              >
                AntiFakeAI
              </div>

              <div
                style={{
                  fontSize: '10px',
                  color: 'var(--text-3)',
                  fontFamily: 'var(--mono)',
                  textTransform: 'uppercase',
                  marginTop: 2,
                }}
              >
                Cosmetic verification
              </div>
            </div>
          </div>
        </div>

        <SectionLabel text="Navigation" />

        <nav
          style={{
            flex: 1,
            padding: '4px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflowY: 'auto',
          }}
        >
          {navItems
            .filter((item) => isAuth || item.public)
            .map((item) => (
              <SidebarLink key={item.to} item={item} />
            ))}
        </nav>

        <div
          style={{
            padding: '12px 8px',
            borderTop: '1px solid var(--border)',
          }}
        >
          {isAuth ? (
            <button
              onClick={handleLogout}
              style={footerButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--red-border)';
                e.currentTarget.style.color = 'var(--red)';
                e.currentTarget.style.background = 'var(--red-bg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-2)';
                e.currentTarget.style.background = 'var(--bg-3)';
              }}
            >
              <LogOut size={17} strokeWidth={2.1} />
              Выйти
            </button>
          ) : (
            <button
              onClick={() => navigate('/login')}
              style={footerButtonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-active)';
                e.currentTarget.style.color = 'var(--accent)';
                e.currentTarget.style.background = 'var(--accent-subtle)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.color = 'var(--text-2)';
                e.currentTarget.style.background = 'var(--bg-3)';
              }}
            >
              <LogIn size={17} strokeWidth={2.1} />
              Войти
            </button>
          )}
        </div>
      </aside>

      <main
        style={{
          flex: 1,
          overflow: 'auto',
          background:
            'radial-gradient(circle at top left, rgba(43,138,255,0.06), transparent 32%), var(--bg)',
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            padding: '28px 32px',
          }}
        >
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function SidebarLink({ item }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      end={item.exact}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '9px 11px',
        borderRadius: 9,
        color: isActive ? 'var(--text)' : 'var(--text-2)',
        background: isActive ? 'var(--bg-4)' : 'transparent',
        border: isActive ? '1px solid var(--border-active)' : '1px solid transparent',
        fontSize: '13px',
        fontWeight: isActive ? 600 : 400,
        transition: 'all var(--transition)',
        textDecoration: 'none',
        position: 'relative',
      })}
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              style={{
                position: 'absolute',
                left: 0,
                top: '24%',
                bottom: '24%',
                width: 3,
                borderRadius: 4,
                background: 'var(--accent)',
              }}
            />
          )}

          <span
            style={{
              width: 24,
              height: 24,
              borderRadius: 7,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isActive ? 'var(--accent)' : 'var(--text-3)',
              background: isActive ? 'var(--accent-subtle)' : 'transparent',
            }}
          >
            <Icon size={17} strokeWidth={2.1} />
          </span>

          <span>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

function SectionLabel({ text }) {
  return (
    <div style={{ padding: '15px 16px 7px' }}>
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: 'var(--text-3)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontFamily: 'var(--mono)',
        }}
      >
        {text}
      </span>
    </div>
  );
}

const footerButtonStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 9,
  border: '1px solid var(--border)',
  background: 'var(--bg-3)',
  color: 'var(--text-2)',
  cursor: 'pointer',
  fontSize: '13px',
  fontFamily: 'var(--font)',
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  transition: 'all var(--transition)',
};