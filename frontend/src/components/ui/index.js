import { useState } from 'react';

// ── Button ──────────────────────────────────────────────
export function Btn({ children, variant = 'primary', size = 'md', loading, disabled, onClick, type = 'button', ...props }) {
  const base = {
    display: 'inline-flex', alignItems: 'center', gap: '6px',
    fontFamily: 'var(--font)', fontWeight: 500, letterSpacing: '-0.01em',
    border: '1px solid transparent', borderRadius: 'var(--radius)',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all var(--transition)',
    outline: 'none',
    padding: size === 'sm' ? '4px 10px' : size === 'lg' ? '10px 22px' : '7px 14px',
    fontSize: size === 'sm' ? '12px' : size === 'lg' ? '14px' : '13px',
    lineHeight: '1.4',
    whiteSpace: 'nowrap',
  };

  const variants = {
    primary: {
      background: 'var(--accent)',
      color: '#fff',
      borderColor: 'var(--accent)',
      boxShadow: '0 1px 3px rgba(43,138,255,0.3)',
    },
    secondary: {
      background: 'var(--bg-3)',
      color: 'var(--text)',
      borderColor: 'var(--border-active)',
    },
    danger: {
      background: 'var(--red-bg)',
      color: 'var(--red)',
      borderColor: 'var(--red-border)',
    },
    ghost: {
      background: 'transparent',
      color: 'var(--text-2)',
      borderColor: 'transparent',
    },
    success: {
      background: 'var(--green-bg)',
      color: 'var(--green)',
      borderColor: 'var(--green-border)',
    },
  };

  const [hovered, setHovered] = useState(false);
  const hoverStyles = {
    primary: { background: '#1a7aef', borderColor: '#1a7aef' },
    secondary: { background: 'var(--bg-4)', borderColor: 'var(--border-strong)' },
    danger: { background: 'rgba(240,69,90,0.14)', borderColor: 'rgba(240,69,90,0.35)' },
    ghost: { background: 'var(--bg-3)', color: 'var(--text)' },
    success: { background: 'rgba(22,199,132,0.14)', borderColor: 'rgba(22,199,132,0.35)' },
  };

  const style = {
    ...base,
    ...variants[variant],
    ...(hovered && !disabled && !loading ? hoverStyles[variant] : {}),
  };

  return (
    <button
      type={type}
      style={style}
      disabled={disabled || loading}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      {...props}
    >
      {loading && <Spinner size={13} />}
      {children}
    </button>
  );
}

// ── Spinner ──────────────────────────────────────────────
export function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 0.75s linear infinite', flexShrink: 0 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
        strokeDasharray="44" strokeDashoffset="14" opacity="0.9" />
    </svg>
  );
}

// ── Input ──────────────────────────────────────────────
export function Input({ label, error, prefix, ...props }) {
  const [focused, setFocused] = useState(false);
  const wrap = { display: 'flex', flexDirection: 'column', gap: '5px' };
  const lbl = {
    fontSize: '11.5px', fontWeight: 500, color: 'var(--text-2)',
    letterSpacing: '0.01em',
  };
  const inp = {
    background: 'var(--bg-3)',
    border: `1px solid ${error ? 'var(--red-border)' : focused ? 'var(--border-active)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)',
    padding: prefix ? '8px 12px 8px 34px' : '8px 12px',
    color: 'var(--text)', fontSize: '13.5px', width: '100%',
    outline: 'none', transition: 'border-color var(--transition), box-shadow var(--transition)',
    fontFamily: 'var(--font)',
    boxShadow: focused ? '0 0 0 3px var(--accent-subtle)' : 'none',
  };
  return (
    <div style={wrap}>
      {label && <label style={lbl}>{label}</label>}
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-3)', fontSize: 13, pointerEvents: 'none',
          }}>{prefix}</span>
        )}
        <input
          style={inp} {...props}
          onFocus={e => { setFocused(true); props.onFocus?.(e); }}
          onBlur={e => { setFocused(false); props.onBlur?.(e); }}
        />
      </div>
      {error && <span style={{ fontSize: '11px', color: 'var(--red)', letterSpacing: '0.01em' }}>{error}</span>}
    </div>
  );
}

// ── Select ──────────────────────────────────────────────
export function Select({ label, children, error, ...props }) {
  const [focused, setFocused] = useState(false);
  const lbl = { fontSize: '11.5px', fontWeight: 500, color: 'var(--text-2)', letterSpacing: '0.01em' };
  const sel = {
    background: 'var(--bg-3)',
    border: `1px solid ${error ? 'var(--red-border)' : focused ? 'var(--border-active)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)', padding: '8px 12px',
    color: 'var(--text)', fontSize: '13.5px', width: '100%', outline: 'none',
    fontFamily: 'var(--font)', cursor: 'pointer',
    boxShadow: focused ? '0 0 0 3px var(--accent-subtle)' : 'none',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={lbl}>{label}</label>}
      <select style={sel} {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >{children}</select>
      {error && <span style={{ fontSize: '11px', color: 'var(--red)' }}>{error}</span>}
    </div>
  );
}

// ── Textarea ──────────────────────────────────────────────
export function Textarea({ label, ...props }) {
  const [focused, setFocused] = useState(false);
  const lbl = { fontSize: '11.5px', fontWeight: 500, color: 'var(--text-2)', letterSpacing: '0.01em' };
  const ta = {
    background: 'var(--bg-3)',
    border: `1px solid ${focused ? 'var(--border-active)' : 'var(--border)'}`,
    borderRadius: 'var(--radius)', padding: '8px 12px',
    color: 'var(--text)', fontSize: '13.5px', width: '100%', outline: 'none',
    fontFamily: 'var(--font)', resize: 'vertical', minHeight: 88,
    lineHeight: 1.6,
    boxShadow: focused ? '0 0 0 3px var(--accent-subtle)' : 'none',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      {label && <label style={lbl}>{label}</label>}
      <textarea style={ta} {...props}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

// ── Badge ──────────────────────────────────────────────
export function Badge({ children, color = 'default' }) {
  const colors = {
    default: { background: 'var(--bg-4)', color: 'var(--text-2)', borderColor: 'var(--border)' },
    green:   { background: 'var(--green-bg)', color: 'var(--green)', borderColor: 'var(--green-border)' },
    red:     { background: 'var(--red-bg)', color: 'var(--red)', borderColor: 'var(--red-border)' },
    yellow:  { background: 'var(--yellow-bg)', color: 'var(--yellow)', borderColor: 'var(--yellow-border)' },
    blue:    { background: 'var(--blue-bg)', color: 'var(--blue)', borderColor: 'var(--blue-border)' },
    purple:  { background: 'rgba(43,138,255,0.08)', color: 'var(--accent)', borderColor: 'rgba(43,138,255,0.2)' },
  };
  const dot = { default: '#445567', green: 'var(--green)', red: 'var(--red)', yellow: 'var(--yellow)', blue: 'var(--blue)', purple: 'var(--accent)' };
  return (
    <span style={{
      ...colors[color],
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 4,
      fontSize: '11px', fontWeight: 500, letterSpacing: '0.02em',
      fontFamily: 'var(--mono)',
      border: '1px solid',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: dot[color], flexShrink: 0 }} />
      {children}
    </span>
  );
}

// ── Card ──────────────────────────────────────────────
export function Card({ children, style, ...props }) {
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '20px',
      ...style
    }} {...props}>
      {children}
    </div>
  );
}

// ── Modal ──────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 480 }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }} onClick={onClose}>
      <div style={{
        background: 'var(--bg-2)',
        border: '1px solid var(--border-active)',
        borderRadius: 10,
        width: '100%', maxWidth: width,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(99,152,210,0.05)',
        animation: 'modalIn 0.16s ease',
      }} onClick={e => e.stopPropagation()}>
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(10px) scale(0.99)}to{opacity:1;transform:none}}`}</style>

        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
        }}>
          <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</h3>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--text-3)',
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 5, cursor: 'pointer', fontSize: '16px', lineHeight: 1,
            transition: 'color var(--transition), background var(--transition)',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}
          >✕</button>
        </div>

        <div style={{ padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}

// ── Table ──────────────────────────────────────────────
export function Table({ columns, data, emptyText = 'Нет данных', loading }) {
  const tableStyle = { width: '100%', borderCollapse: 'collapse' };
  const thStyle = {
    textAlign: 'left', padding: '9px 14px',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.03em',
    color: 'var(--text-3)', borderBottom: '1px solid var(--border)',
    fontFamily: 'var(--mono)',
    background: 'var(--bg-2)',
    textTransform: 'uppercase',
  };
  const tdStyle = {
    padding: '11px 14px', borderBottom: '1px solid var(--border)',
    color: 'var(--text)', fontSize: '13px', lineHeight: 1.4,
  };

  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '56px 0' }}>
      <Spinner size={24} />
      <span style={{ color: 'var(--text-3)', fontSize: '12px', fontFamily: 'var(--mono)' }}>Загрузка...</span>
    </div>
  );

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            {columns.map(c => (
              <th key={c.key} style={{ ...thStyle, width: c.width }}>{c.title}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!data?.length
            ? (
              <tr>
                <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: 'var(--text-3)', padding: '48px 0', fontFamily: 'var(--mono)', fontSize: '12px' }}>
                  {emptyText}
                </td>
              </tr>
            )
            : data.map((row, i) => (
              <tr
                key={row.id ?? i}
                style={{ transition: 'background var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,152,210,0.03)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                {columns.map(c => (
                  <td key={c.key} style={tdStyle}>
                    {c.render ? c.render(row[c.key], row) : row[c.key] ?? <span style={{ color: 'var(--text-3)' }}>—</span>}
                  </td>
                ))}
              </tr>
            ))
          }
        </tbody>
      </table>
    </div>
  );
}

// ── Toast ──────────────────────────────────────────────
let _toastFn = null;
export const toast = {
  success: (msg) => _toastFn?.({ msg, type: 'success' }),
  error: (msg) => _toastFn?.({ msg, type: 'error' }),
  info: (msg) => _toastFn?.({ msg, type: 'info' }),
};

export function ToastProvider() {
  const [toasts, setToasts] = useState([]);
  _toastFn = ({ msg, type }) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500);
  };
  const colors = { success: 'var(--green)', error: 'var(--red)', info: 'var(--accent)' };
  const icons = { success: '✓', error: '✕', info: 'ℹ' };
  const iconBg = { success: 'var(--green-bg)', error: 'var(--red-bg)', info: 'var(--accent-subtle)' };
  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          background: 'var(--bg-3)',
          border: '1px solid var(--border-active)',
          borderRadius: 'var(--radius)',
          padding: '11px 14px',
          color: 'var(--text)', fontSize: '13px', fontWeight: 400,
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          animation: 'toastIn 0.18s ease',
          minWidth: 260, maxWidth: 340,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}`}</style>
          <span style={{
            width: 20, height: 20, borderRadius: 4,
            background: iconBg[t.type], color: colors[t.type],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '11px', fontWeight: 700, flexShrink: 0,
          }}>{icons[t.type]}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Confirm Dialog ──────────────────────────────────────────────
export function useConfirm() {
  const [state, setState] = useState({ open: false, msg: '', resolve: null });
  const confirm = (msg) => new Promise(res => setState({ open: true, msg, resolve: res }));
  const answer = (val) => { state.resolve?.(val); setState({ open: false, msg: '', resolve: null }); };
  const Dialog = () => (
    <Modal open={state.open} onClose={() => answer(false)} title="Подтверждение" width={380}>
      <p style={{ color: 'var(--text-2)', marginBottom: 20, lineHeight: 1.65, fontSize: '13px' }}>{state.msg}</p>
      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
        <Btn variant="secondary" onClick={() => answer(false)}>Отмена</Btn>
        <Btn variant="danger" onClick={() => answer(true)}>Подтвердить</Btn>
      </div>
    </Modal>
  );
  return { confirm, Dialog };
}

// ── Page header ──────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
      marginBottom: 24, paddingBottom: 20,
      borderBottom: '1px solid var(--border)',
    }}>
      <div>
        <h1 style={{
          fontSize: '20px', fontWeight: 600,
          letterSpacing: '-0.03em', color: 'var(--text)',
          lineHeight: 1.2,
        }}>{title}</h1>
        {subtitle && (
          <p style={{ color: 'var(--text-3)', marginTop: 3, fontSize: '12.5px', letterSpacing: '-0.005em' }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

// ── Stat Card ──────────────────────────────────────────────
export function StatCard({ label, value, icon, color = 'purple', delta }) {
  const colorMap = {
    purple: { accent: 'var(--accent)', border: 'rgba(43,138,255,0.15)', glow: 'rgba(43,138,255,0.06)' },
    green:  { accent: 'var(--green)', border: 'var(--green-border)', glow: 'rgba(22,199,132,0.06)' },
    red:    { accent: 'var(--red)', border: 'var(--red-border)', glow: 'rgba(240,69,90,0.06)' },
    blue:   { accent: 'var(--blue)', border: 'var(--blue-border)', glow: 'rgba(59,130,246,0.06)' },
    yellow: { accent: 'var(--yellow)', border: 'var(--yellow-border)', glow: 'rgba(232,160,32,0.06)' },
  };
  const c = colorMap[color] || colorMap.purple;
  return (
    <div style={{
      background: 'var(--bg-2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)',
      padding: '18px',
      flex: 1, minWidth: 150,
      position: 'relative',
      overflow: 'hidden',
      transition: 'border-color var(--transition)',
    }}
      onMouseEnter={e => e.currentTarget.style.borderColor = c.border}
      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
    >
      {/* Top accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, ${c.accent}60, transparent)`,
      }} />

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{
          fontSize: '11px', fontWeight: 500, color: 'var(--text-3)',
          letterSpacing: '0.02em', textTransform: 'uppercase',
          fontFamily: 'var(--mono)',
        }}>{label}</span>
        <div style={{
          width: 32, height: 32, borderRadius: 6,
          background: c.glow,
          border: `1px solid ${c.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px',
        }}>{icon}</div>
      </div>
      <div style={{
        fontSize: '28px', fontWeight: 600,
        letterSpacing: '-0.04em', color: 'var(--text)',
        lineHeight: 1,
      }}>{value ?? '—'}</div>
      {delta !== undefined && (
        <div style={{ marginTop: 8, fontSize: '11px', color: delta >= 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--mono)' }}>
          {delta >= 0 ? '↑' : '↓'} {Math.abs(delta)} за сегодня
        </div>
      )}
    </div>
  );
}

// ── Empty State ──────────────────────────────────────────────
export function EmptyState({ icon = '◻', title, description }) {
  return (
    <div style={{ textAlign: 'center', padding: '56px 20px' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: 'var(--bg-4)', border: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '20px', margin: '0 auto 14px',
      }}>{icon}</div>
      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: 6, color: 'var(--text)', letterSpacing: '-0.01em' }}>{title}</h3>
      {description && (
        <p style={{ color: 'var(--text-3)', fontSize: '12.5px', maxWidth: 280, margin: '0 auto', lineHeight: 1.6 }}>{description}</p>
      )}
    </div>
  );
}

export function Skeleton({ width = '100%', height = 20, radius = 8 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background:
          'linear-gradient(90deg, var(--bg-3) 25%, var(--bg-4) 50%, var(--bg-3) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonLoading 1.2s ease-in-out infinite',
      }}
    />
  );
  
}
export function FileZone({ label, hint, required, file, onChange }) {
  const fileName = file?.name;

  return (
    <label
      style={{
        display: 'block',
        background: 'var(--bg-3)',
        border: '1px dashed var(--border-active)',
        borderRadius: 'var(--radius)',
        padding: '14px',
        cursor: 'pointer',
        minHeight: 110,
        transition: 'all var(--transition)',
      }}
    >
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => onChange?.(e.target.files?.[0] || null)}
      />

      <div style={{ fontSize: 22, marginBottom: 8 }}>
        {file ? '✅' : '📤'}
      </div>

      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text)' }}>
        {label} {required && <span style={{ color: 'var(--red)' }}>*</span>}
      </div>

      {hint && (
        <div
          style={{
            fontSize: '11.5px',
            color: 'var(--text-3)',
            marginTop: 4,
            lineHeight: 1.4,
          }}
        >
          {hint}
        </div>
      )}

      {fileName && (
        <div
          style={{
            marginTop: 10,
            fontSize: '11.5px',
            color: 'var(--accent)',
            fontFamily: 'var(--mono)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {fileName}
        </div>
      )}
    </label>
  );
}
