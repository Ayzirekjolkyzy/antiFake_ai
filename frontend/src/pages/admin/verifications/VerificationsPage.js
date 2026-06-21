import { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldX,
  Search,
  AlertTriangle,
  BadgeCheck,
  XCircle,
} from 'lucide-react';

import { verificationsAPI } from '../../../api/services';
import {
  Btn, Badge, Modal, Textarea, Table, PageHeader,
  useConfirm, toast, Card
} from '../../../components/ui';

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

function angleMismatch(item) {
  return (
    item?.selectedAngle &&
    item?.detectedAngle &&
    item.selectedAngle !== item.detectedAngle
  );
}

function isAdminConfirmed(item) {
  return (
    item?.decisionStatus === 'ADMIN_CONFIRMED_ORIGINAL' ||
    item?.decisionStatus === 'ADMIN_CONFIRMED_FAKE' ||
    item?.decisionStatus === 'ADMIN_REJECTED'
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
  if (item.decisionStatus === 'ADMIN_REJECTED') return 'yellow';
  if (item.decisionStatus === 'NEEDS_REVIEW') return 'yellow';

  if (item.verdict === 'ORIGINAL') return 'green';
  if (item.verdict === 'FAKE') return 'red';

  return 'yellow';
}

function confirmationText(item) {
  if (isAdminConfirmed(item)) return 'Проверено администратором';

  if (
    item.decisionStatus === 'AUTO_ORIGINAL' ||
    item.decisionStatus === 'AUTO_FAKE' ||
    item.decisionStatus === 'NEEDS_REVIEW'
  ) {
    return 'AI-результат · ожидает решения администратора';
  }

  return 'Ожидает проверки';
}

function barcodeText(item) {
  if (item.barcodeMatch === true) return 'Совпадает';
  if (item.barcodeMatch === false) return 'Не совпадает';
  return 'Не указан';
}

function barcodeColor(item) {
  if (item.barcodeMatch === true) return 'green';
  if (item.barcodeMatch === false) return 'red';
  return 'yellow';
}

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('ru-RU') : '—';
}

function formatDateTime(date) {
  return date ? new Date(date).toLocaleString('ru-RU') : '—';
}

function percent(value) {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

function ResultIcon({ item }) {
  const mismatch = angleMismatch(item);

  let Icon = Search;
  let color = 'var(--yellow)';
  let bg = 'var(--yellow-bg)';
  let border = 'var(--yellow-border)';

  if (mismatch) {
    Icon = AlertTriangle;
  } else if (item.decisionStatus === 'ADMIN_CONFIRMED_ORIGINAL') {
    Icon = BadgeCheck;
    color = 'var(--green)';
    bg = 'var(--green-bg)';
    border = 'var(--green-border)';
  } else if (item.decisionStatus === 'ADMIN_CONFIRMED_FAKE') {
    Icon = ShieldX;
    color = 'var(--red)';
    bg = 'var(--red-bg)';
    border = 'var(--red-border)';
  } else if (item.decisionStatus === 'ADMIN_REJECTED') {
    Icon = XCircle;
  } else if (item.verdict === 'ORIGINAL') {
    Icon = ShieldCheck;
    color = 'var(--green)';
    bg = 'var(--green-bg)';
    border = 'var(--green-border)';
  } else if (item.verdict === 'FAKE') {
    Icon = ShieldX;
    color = 'var(--red)';
    bg = 'var(--red-bg)';
    border = 'var(--red-border)';
  }

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

export default function VerificationsPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [tab, setTab] = useState(location.state?.openTab || 'queue');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [autoOpenedId, setAutoOpenedId] = useState(null);

  const [actionModal, setActionModal] = useState(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [imageView, setImageView] = useState(null);

  const { Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res =
        tab === 'queue'
          ? await verificationsAPI.getReviewQueue()
          : await verificationsAPI.getAll();

      setData(res.data || []);
    } catch {
      toast.error('Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const openRequestId = location.state?.openRequestId;

    if (!openRequestId || data.length === 0) return;
    if (String(autoOpenedId) === String(openRequestId)) return;

    const found = data.find(
      (v) => String(v.requestId) === String(openRequestId)
    );

    if (found) {
      setSelected(found);
      setAutoOpenedId(openRequestId);

      navigate(location.pathname, {
        replace: true,
        state: {},
      });
    }
  }, [location.state, location.pathname, data, autoOpenedId, navigate]);

  const handleAction = async () => {
    if (!actionModal) return;

    setSubmitting(true);

    try {
      const { type, id } = actionModal;

      if (type === 'original') {
        await verificationsAPI.confirmOriginal(id, comment);
      } else if (type === 'fake') {
        await verificationsAPI.confirmFake(id, comment);
      } else {
        await verificationsAPI.reject(id, comment);
      }

      toast.success(
        type === 'original'
          ? 'Подтверждено: оригинал'
          : type === 'fake'
            ? 'Подтверждено: подделка'
            : 'Заявка отклонена'
      );

      setActionModal(null);
      setComment('');
      setSelected(null);
      load();
    } catch {
      toast.error('Ошибка при обработке заявки');
    } finally {
      setSubmitting(false);
    }
  };

  const tabBtn = (key, label, count) => (
    <button
      onClick={() => setTab(key)}
      style={{
        padding: '7px 16px',
        borderRadius: 8,
        border: 'none',
        cursor: 'pointer',
        background: tab === key ? 'var(--accent)' : 'var(--bg-3)',
        color: tab === key ? '#fff' : 'var(--text-2)',
        fontSize: 13,
        fontWeight: 600,
        fontFamily: 'var(--font)',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {label}

      {count > 0 && (
        <span
          style={{
            background:
              tab === key
                ? 'rgba(255,255,255,0.25)'
                : 'var(--accent)',
            color: '#fff',
            borderRadius: 10,
            padding: '1px 6px',
            fontSize: 10,
            fontWeight: 700,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );

  const queueCount = tab === 'queue' ? data.length : 0;

  return (
    <div>
      <PageHeader
        title="Верификации"
        subtitle="Управление заявками на проверку подлинности"
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {tabBtn('queue', 'Очередь', queueCount)}
        {tabBtn('all', 'Все заявки', 0)}
      </div>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          loading={loading}
          emptyText="Нет заявок"
          columns={[
            {
              key: 'requestId',
              title: 'ID',
              width: 60,
            },
            {
              key: 'productName',
              title: 'Заявка',
              render: (v, r) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <ResultIcon item={r} />

                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {v || `#${r.productId}`}
                    </div>

                    <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 3 }}>
                      #{r.requestId} · {formatDate(r.requestedAt)}
                    </div>

                    {r.selectedAngle && (
                      <div
                        style={{
                          fontSize: 11.5,
                          color: angleMismatch(r) ? 'var(--yellow)' : 'var(--text-3)',
                          marginTop: 3,
                        }}
                      >
                        {angleMismatch(r)
                          ? `Ракурс не совпадает: ${angleLabel(r.selectedAngle)} → ${angleLabel(r.detectedAngle)}`
                          : `Ракурс: ${angleLabel(r.selectedAngle)}`}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 11,
                        color: isAdminConfirmed(r) ? 'var(--green)' : 'var(--text-3)',
                        marginTop: 3,
                      }}
                    >
                      {confirmationText(r)}
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: 'barcodeInput',
              title: 'Штрих-код',
              render: (_, r) => (
                <div>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 12 }}>
                    {r.barcodeInput || '—'}
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Badge color={barcodeColor(r)} size="sm">
                      {barcodeText(r)}
                    </Badge>
                  </div>
                </div>
              ),
            },
            {
              key: 'imageScore',
              title: 'AI сходство',
              render: (v) => (
                <span style={{ fontFamily: 'var(--mono)' }}>
                  {percent(v)}
                </span>
              ),
            },
            {
              key: 'verdict',
              title: 'Итог',
              render: (_, r) => (
                <Badge color={resultColor(r)} size="sm">
                  {resultLabel(r)}
                </Badge>
              ),
            },
            {
              key: '_',
              title: 'Действия',
              width: 120,
              render: (_, row) => (
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() => setSelected(row)}
                >
                  Открыть
                </Btn>
              ),
            },
          ]}
          data={data}
        />
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={`Заявка #${selected?.requestId}`}
        width={720}
      >
        {selected && (
          <div
            style={{
              maxHeight: '72vh',
              overflowY: 'auto',
              paddingRight: 6,
            }}
          >
            <VerificationDetail
              selected={selected}
              setImageView={setImageView}
              setActionModal={setActionModal}
            />
          </div>
        )}
      </Modal>

      <Modal
        open={!!actionModal}
        onClose={() => {
          setActionModal(null);
          setComment('');
        }}
        title={
          actionModal?.type === 'original'
            ? 'Подтвердить оригинал'
            : actionModal?.type === 'fake'
              ? 'Подтвердить подделку'
              : 'Отклонить заявку'
        }
        width={420}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Textarea
            label="Комментарий (необязательно)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Добавьте пояснение для пользователя..."
          />

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
            }}
          >
            <Btn
              variant="secondary"
              onClick={() => {
                setActionModal(null);
                setComment('');
              }}
            >
              Отмена
            </Btn>

            <Btn
              variant={
                actionModal?.type === 'original'
                  ? 'success'
                  : 'danger'
              }
              loading={submitting}
              onClick={handleAction}
            >
              {actionModal?.type === 'original'
                ? 'Подтвердить оригинал'
                : actionModal?.type === 'fake'
                  ? 'Это подделка'
                  : 'Отклонить'}
            </Btn>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!imageView}
        onClose={() => setImageView(null)}
        title="Фото"
        width={700}
      >
        {imageView && (
          <img
            src={imageView}
            alt="full"
            style={{
              width: '100%',
              borderRadius: 8,
              maxHeight: '75vh',
              objectFit: 'contain',
            }}
          />
        )}
      </Modal>

      <Dialog />
    </div>
  );
}

function VerificationDetail({ selected, setImageView, setActionModal }) {
  const mismatch = angleMismatch(selected);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div
        style={{
          background: 'var(--bg-3)',
          borderRadius: 10,
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <ResultIcon item={selected} />

        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>
            {selected.productName || `#${selected.productId}`}
          </div>

          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 3 }}>
            {confirmationText(selected)}
          </div>
        </div>

        <Badge color={resultColor(selected)}>
          {resultLabel(selected)}
        </Badge>
      </div>

      {mismatch && (
        <div
          style={{
            background: 'var(--yellow-bg)',
            border: '1px solid var(--yellow-border)',
            borderRadius: 8,
            padding: '12px 14px',
            color: 'var(--yellow)',
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          Выбран ракурс <b>{angleLabel(selected.selectedAngle)}</b>, но изображение больше похоже на{' '}
          <b>{angleLabel(selected.detectedAngle)}</b>. Оценка рассчитана по выбранному ракурсу, поэтому результат может быть неточным.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <InfoBox label="Дата и время заявки" value={formatDateTime(selected.requestedAt || selected.submittedAt || selected.createdAt)} />
        <InfoBox label="Решение AI" value={selected.decisionStatus || '—'} />
        <InfoBox label="Выбранный ракурс" value={angleLabel(selected.selectedAngle)} />
        <InfoBox label="Наиболее похожий ракурс" value={mismatch ? angleLabel(selected.detectedAngle) : 'Совпадает с выбранным'} warning={mismatch} />
        <InfoBox label="Сходство с выбранным ракурсом" value={percent(selected.imageScore)} />
        <InfoBox label="Уверенность" value={percent(selected.confidenceScore)} />
        <InfoBox label="Введён штрих-код" value={selected.barcodeInput || '—'} mono />
        <InfoBox label="Совпадение штрих-кода" value={barcodeText(selected)} warning={selected.barcodeMatch === false} />
      </div>

      {selected.reason && (
        <InfoBox label="Причина" value={selected.reason} full />
      )}

      {selected.adminComment && (
        <InfoBox label="Комментарий администратора" value={selected.adminComment} full accent />
      )}

      {selected.images?.length > 0 && (
        <div>
          <InfoLabel>Фотографии ({selected.images.length})</InfoLabel>

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginTop: 10,
            }}
          >
            {selected.images.map((img, i) => {
              const url = img.url || img.imageUrl;

              return (
                <div
                  key={i}
                  onClick={() => setImageView(url)}
                  style={{
                    width: 90,
                    height: 90,
                    borderRadius: 8,
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    background: 'var(--bg-4)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={url}
                    alt={img.angle || 'photo'}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selected.status === 'PENDING' && (
        <div
          style={{
            display: 'flex',
            gap: 8,
            paddingTop: 12,
            borderTop: '1px solid var(--border)',
          }}
        >
          <Btn
            variant="success"
            onClick={() =>
              setActionModal({
                type: 'original',
                id: selected.requestId,
              })
            }
          >
            Подтвердить оригинал
          </Btn>

          <Btn
            variant="danger"
            onClick={() =>
              setActionModal({
                type: 'fake',
                id: selected.requestId,
              })
            }
          >
            Подтвердить подделку
          </Btn>

          <Btn
            variant="secondary"
            onClick={() =>
              setActionModal({
                type: 'reject',
                id: selected.requestId,
              })
            }
          >
            Отклонить
          </Btn>
        </div>
      )}
    </div>
  );
}

function InfoLabel({ children }) {
  return (
    <div
      style={{
        fontSize: 11,
        color: 'var(--text-3)',
        fontFamily: 'var(--mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        marginBottom: 6,
      }}
    >
      {children}
    </div>
  );
}

function InfoBox({ label, value, mono, warning, full, accent }) {
  return (
    <div
      style={{
        background: accent ? 'var(--accent-subtle)' : 'var(--bg-3)',
        border: warning ? '1px solid var(--yellow-border)' : accent ? '1px solid rgba(43,138,255,0.15)' : '1px solid transparent',
        borderRadius: 8,
        padding: 14,
        gridColumn: full ? 'span 2' : 'auto',
      }}
    >
      <InfoLabel>{label}</InfoLabel>

      <div
        style={{
          fontFamily: mono ? 'var(--mono)' : 'var(--font)',
          fontSize: 13,
          color: warning ? 'var(--yellow)' : 'var(--text)',
          lineHeight: 1.6,
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}