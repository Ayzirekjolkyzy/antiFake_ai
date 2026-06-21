import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { verificationsAPI } from '../../api/services';
import { Badge, Modal, Skeleton, Btn, EmptyState } from '../../components/ui';
import {
  ShieldCheck,
  ShieldX,
  Search,
  AlertTriangle,
} from 'lucide-react';


const angleLabels = {
  FRONT: 'Передняя сторона',
  BACK: 'Задняя сторона',
  SIDE_LEFT: 'Левая сторона',
  SIDE_RIGHT: 'Правая сторона',
  TOP_WITH_CAP: 'Верх с крышкой',
  TOP_WITHOUT_CAP: 'Верх без крышки',
  BOX_FRONT: 'Коробка спереди',
  BOX_BACK: 'Коробка сзади',
  BOX_SIDE_LEFT: 'Коробка слева',
  BOX_SIDE_RIGHT: 'Коробка справа',
  BOX_TOP: 'Верх коробки',
  LOGO: 'Логотип',
  TEXT: 'Текст на товаре',
  BOX_TEXT: 'Текст на коробке',
  CAP: 'Крышка / дозатор',
  BARCODE: 'Штрих-код',
  INGREDIENTS: 'Состав',
  UNKNOWN: 'Неизвестно',
};

function angleLabel(angle) {
  return angleLabels[angle] || angle || '—';
}

function verdictColor(v) {
  if (v === 'ORIGINAL') return 'green';
  if (v === 'FAKE') return 'red';
  return 'yellow';
}

function verdictLabel(v) {
  if (v === 'ORIGINAL') return 'Оригинал';
  if (v === 'FAKE') return 'Подделка';
  return 'На проверке';
}

function statusLabel(s) {
  if (s === 'COMPLETED') return 'Завершён';
  if (s === 'FAILED') return 'Ошибка';
  return 'В обработке';
}

function statusColor(s) {
  if (s === 'COMPLETED') return 'green';
  if (s === 'FAILED') return 'red';
  return 'yellow';
}

function decisionLabel(d) {
  const map = {
    AUTO_ORIGINAL: 'Авто: Оригинал',
    AUTO_FAKE: 'Авто: Подделка',
    NEEDS_REVIEW: 'Ручная проверка',
    ADMIN_CONFIRMED_ORIGINAL: 'Подтверждён оригинал',
    ADMIN_CONFIRMED_FAKE: 'Подтверждена подделка',
    ADMIN_REJECTED: 'Отклонён',
  };
  return map[d] || d;
}

function isAdminConfirmed(item) {
  return (
    item.decisionStatus === 'ADMIN_CONFIRMED_ORIGINAL' ||
    item.decisionStatus === 'ADMIN_CONFIRMED_FAKE' ||
    item.decisionStatus === 'ADMIN_REJECTED'
  );
}

function resultLabel(item) {
  if (item.decisionStatus === 'ADMIN_CONFIRMED_ORIGINAL') return 'Подтверждён оригинал';
  if (item.decisionStatus === 'ADMIN_CONFIRMED_FAKE') return 'Подтверждена подделка';
  if (item.decisionStatus === 'ADMIN_REJECTED') return 'Отклонён';

  if (item.decisionStatus === 'NEEDS_REVIEW') return 'Требуется проверка';

  if (item.verdict === 'ORIGINAL') return 'Оригинал';
  if (item.verdict === 'FAKE') return 'Подделка';

  return 'На проверке';
}

function resultColor(item) {
  if (item.decisionStatus === 'NEEDS_REVIEW') return 'yellow';
  if (item.decisionStatus === 'ADMIN_REJECTED') return 'yellow';

  if (item.verdict === 'ORIGINAL') return 'green';
  if (item.verdict === 'FAKE') return 'red';

  return 'yellow';
}

function confirmationText(item) {
  if (isAdminConfirmed(item)) {
    return 'Проверено администратором';
  }

  if (
    item.decisionStatus === 'AUTO_ORIGINAL' ||
    item.decisionStatus === 'AUTO_FAKE' ||
    item.decisionStatus === 'NEEDS_REVIEW'
  ) {
    return 'AI-результат · ожидает подтверждения администратора';
  }

  return null;
}

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [imageView, setImageView] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    verificationsAPI.getMyHistory()
      .then(r => setHistory(r.data || []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em' }}>История проверок</h1>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(5)].map((_, i) => <Skeleton key={i} height={70} radius={8} />)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em' }}>История проверок</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 3, fontSize: '13px' }}>
            {history.length} {history.length === 1 ? 'запрос' : 'запросов'}
          </p>
        </div>
        <Btn size="sm" onClick={() => navigate('/verify')}>+ Новая проверка</Btn>
      </div>

{history.length === 0 ? (
  <EmptyState
    icon="📋"
    title="Нет проверок"
    description="Вы ещё не проверяли ни один товар. Начните прямо сейчас!"
    action={<Btn onClick={() => navigate('/verify')}>Проверить товар</Btn>}
  />
) : (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    {history.map((item, i) => (
      <HistoryRow
        key={item.requestId ?? i}
        item={item}
        onClick={() => setSelected(item)}
      />
    ))}
  </div>
)}

      <Modal
  open={!!selected}
  onClose={() => setSelected(null)}
  title={`Запрос #${selected?.requestId}`}
  width={660}
>
  <div
    style={{
      maxHeight: '72vh',
      overflowY: 'auto',
      paddingRight: 6,
    }}
  >
    {selected && <VerificationDetail item={selected} onImageClick={setImageView} />}
  </div>
</Modal>

      <Modal open={!!imageView} onClose={() => setImageView(null)} title="Фото" width={700}>
        {imageView && (
          <img
            src={imageView}
            alt="full"
            style={{ width: '100%', borderRadius: 8, maxHeight: '72vh', objectFit: 'contain' }}
          />
        )}
      </Modal>
    </div>
  );
}

function HistoryRow({ item, onClick }) {
  const [hov, setHov] = useState(false);

  const date = item.requestedAt
    ? new Date(item.requestedAt).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';

const angleMismatch = Boolean(item.angleMismatch);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hov ? 'var(--border-active)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
     <VerdictIcon item={item} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 500, fontSize: '14px', marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.productName || `Продукт #${item.productId}`}
        </div>

        <div style={{ fontSize: '11.5px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
          #{item.requestId} · {date}
        </div>

      {item.selectedAngle && (
        <div
          style={{
            fontSize: '11.5px',
            color: angleMismatch ? 'var(--yellow)' : 'var(--text-3)',
            marginTop: 4,
          }}
        >
          {angleMismatch
            ? `Ракурс не совпадает: выбрано ${angleLabel(item.selectedAngle)}, AI считает ${angleLabel(item.detectedAngle)}`
            : `Ракурс: ${angleLabel(item.selectedAngle)}`}
        </div>
      )}

        {confirmationText(item) && (
          <div
            style={{
              fontSize: '11px',
              color: isAdminConfirmed(item) ? 'var(--green)' : 'var(--text-3)',
              marginTop: 4,
            }}
          >
            {confirmationText(item)}
          </div>
        )}
      </div>

    <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
      <Badge color={resultColor(item)} size="sm">
        {resultLabel(item)}
      </Badge>
    </div>

      <span style={{ color: 'var(--text-3)', fontSize: '14px', flexShrink: 0 }}>›</span>
    </div>
  );
}

function VerdictIcon({ item }) {
  const isOriginal = item.verdict === 'ORIGINAL';
  const isFake = item.verdict === 'FAKE';

  const angleMismatch = Boolean(item.angleMismatch);

  const Icon = angleMismatch
    ? AlertTriangle
    : isOriginal
      ? ShieldCheck
      : isFake
        ? ShieldX
        : Search;

  const color = angleMismatch
    ? 'var(--yellow)'
    : isOriginal
      ? 'var(--green)'
      : isFake
        ? 'var(--red)'
        : 'var(--yellow)';

  const bg = angleMismatch
    ? 'var(--yellow-bg)'
    : isOriginal
      ? 'var(--green-bg)'
      : isFake
        ? 'var(--red-bg)'
        : 'var(--yellow-bg)';

  const border = angleMismatch
    ? 'var(--yellow-border)'
    : isOriginal
      ? 'var(--green-border)'
      : isFake
        ? 'var(--red-border)'
        : 'var(--yellow-border)';

  return (
    <div
      style={{
        width: 42,
        height: 42,
        borderRadius: 10,
        flexShrink: 0,
        background: bg,
        border: `1px solid ${border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Icon size={22} strokeWidth={2.2} color={color} />
    </div>
  );
}

function VerificationDetail({ item, onImageClick }) {
const angleMismatch = Boolean(item.angleMismatch);

  const rows = [
    { label: 'Продукт', value: item.productName || `#${item.productId}` },
    { label: 'Выбранный ракурс', value: item.selectedAngle ? angleLabel(item.selectedAngle) : null },
    {
      label: 'Наиболее похожий ракурс',
      value: angleMismatch ? angleLabel(item.detectedAngle) : null,
      warning: true,
    },
    { label: 'Штрих-код', value: item.barcodeInput, mono: true },
    {
      label: 'Совпадение баркода',
      value: item.barcodeMatch !== null && item.barcodeMatch !== undefined
        ? item.barcodeMatch ? 'Совпадает ✓' : 'Не совпадает ✕'
        : null,
      warning: item.barcodeMatch === false,
    },
    {
      label: 'Уверенность',
      value: item.confidenceScore !== null && item.confidenceScore !== undefined
        ? `${(item.confidenceScore * 100).toFixed(1)}%`
        : null,
    },
   {
      label: 'Сходство с выбранным ракурсом',
      value: item.imageScore !== null && item.imageScore !== undefined
        ? `${(item.imageScore * 100).toFixed(1)}%`
        : null,
    },
    { label: 'Решение', value: item.decisionStatus ? decisionLabel(item.decisionStatus) : null },
    { label: 'Причина', value: item.reason },
    { label: 'Дата запроса', value: item.requestedAt ? new Date(item.requestedAt).toLocaleString('ru-RU') : null },
    { label: 'Дата проверки', value: item.reviewedAt ? new Date(item.reviewedAt).toLocaleString('ru-RU') : null },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          background: item.verdict === 'ORIGINAL' ? 'var(--green-bg)' : item.verdict === 'FAKE' ? 'var(--red-bg)' : 'var(--yellow-bg)',
          border: `1px solid ${item.verdict === 'ORIGINAL' ? 'var(--green-border)' : item.verdict === 'FAKE' ? 'var(--red-border)' : 'var(--yellow-border)'}`,
          borderRadius: 8,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <VerdictIcon item={item} />
        <div>
          <div style={{ fontWeight: 600, fontSize: '15px', color: item.verdict === 'ORIGINAL' ? 'var(--green)' : item.verdict === 'FAKE' ? 'var(--red)' : 'var(--yellow)' }}>
            {resultLabel(item)}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
            {confirmationText(item) || statusLabel(item.status)}
          </div>
        </div>
      </div>

      {angleMismatch && (
        <div
          style={{
            background: 'var(--yellow-bg)',
            border: '1px solid var(--yellow-border)',
            borderRadius: 8,
            padding: '12px 14px',
            color: 'var(--yellow)',
            fontSize: '13px',
            lineHeight: 1.6,
          }}
        >
          ⚠ Вы выбрали <b>{angleLabel(item.selectedAngle)}</b>, но изображение больше похоже на <b>{angleLabel(item.detectedAngle)}</b>.
Оценка фото рассчитана именно по выбранному вами ракурсу, поэтому результат может быть неточным.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {rows.filter(r => r.value).map(r => (
          <div
            key={r.label}
            style={{
              background: 'var(--bg-3)',
              borderRadius: 6,
              padding: '10px 12px',
              border: r.warning ? '1px solid var(--yellow-border)' : '1px solid transparent',
              gridColumn: r.label === 'Причина' ? 'span 2' : 'auto',
            }}
          >
            <div style={{ fontSize: '10.5px', color: r.warning ? 'var(--yellow)' : 'var(--text-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>
              {r.label}
            </div>
            <div style={{ fontSize: '13.5px', color: r.warning ? 'var(--yellow)' : 'var(--text)', fontFamily: r.mono ? 'var(--mono)' : 'var(--font)', lineHeight: 1.5 }}>
              {r.value}
            </div>
          </div>
        ))}
      </div>

      {item.adminComment && (
        <div style={{ background: 'var(--accent-subtle)', border: '1px solid rgba(43,138,255,0.15)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: '10.5px', color: 'var(--accent)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>
            Комментарий администратора
          </div>
          <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.65 }}>{item.adminComment}</p>
        </div>
      )}

      {item.images?.length > 0 && (
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>
            Фотографии ({item.images.length})
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {item.images.map((img, i) => (
              <div
                key={i}
                onClick={() => onImageClick(img.url || img.imageUrl)}
                style={{ width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg-4)', flexShrink: 0, transition: 'border-color var(--transition)' }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-active)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                <img
                  src={img.url || img.imageUrl}
                  alt={img.angle || `photo-${i}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.target.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}