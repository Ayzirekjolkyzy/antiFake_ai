import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ShieldX,
  Search,
  AlertTriangle,
  Users,
  Package,
  Tags,
  Activity,
  TrendingUp,
  BarChart3,
} from 'lucide-react';

import { Card, Badge, Spinner, PageHeader } from '../../components/ui';
import { verificationsAPI, usersAPI, productsAPI, brandsAPI } from '../../api/services';

function getDate(v) {
  return v?.requestedAt || v?.submittedAt || v?.createdAt || null;
}

function formatDate(date) {
  return date
    ? new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—';
}

function isFake(v) {
  return (
    v.verdict === 'FAKE' ||
    v.decisionStatus === 'AUTO_FAKE' ||
    v.decisionStatus === 'ADMIN_CONFIRMED_FAKE'
  );
}

function isOriginal(v) {
  return (
    v.verdict === 'ORIGINAL' ||
    v.decisionStatus === 'AUTO_ORIGINAL' ||
    v.decisionStatus === 'ADMIN_CONFIRMED_ORIGINAL'
  );
}

function isReview(v) {
  return v.decisionStatus === 'NEEDS_REVIEW' || v.status === 'PENDING';
}

function angleMismatch(v) {
  return (
    v.selectedAngle &&
    v.detectedAngle &&
    v.selectedAngle !== v.detectedAngle
  );
}

function resultLabel(v) {
  if (v.decisionStatus === 'ADMIN_CONFIRMED_ORIGINAL') return 'Подтверждён оригинал';
  if (v.decisionStatus === 'ADMIN_CONFIRMED_FAKE') return 'Подтверждена подделка';
  if (v.decisionStatus === 'ADMIN_REJECTED') return 'Отклонён';
  if (v.decisionStatus === 'NEEDS_REVIEW') return 'Требуется проверка';
  if (v.verdict === 'ORIGINAL') return 'Оригинал';
  if (v.verdict === 'FAKE') return 'Подделка';
  return 'На проверке';
}

function resultColor(v) {
  if (isFake(v)) return 'red';
  if (isOriginal(v)) return 'green';
  return 'yellow';
}

function percent(value) {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(1)}%`;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  const [verifications, setVerifications] = useState([]);
  const [usersCount, setUsersCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [brandsCount, setBrandsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      verificationsAPI.getAll(),
      usersAPI.getAll(),
      productsAPI.getAll(),
      brandsAPI.getAll(),
    ])
      .then(([v, u, p, b]) => {
        setVerifications(v.data || []);
        setUsersCount((u.data || []).length);
        setProductsCount((p.data || []).length);
        setBrandsCount((b.data || []).length);
      })
      .finally(() => setLoading(false));
  }, []);

  const analytics = useMemo(() => {
    const total = verifications.length;
    const fakeCount = verifications.filter(isFake).length;
    const originalCount = verifications.filter(isOriginal).length;
    const reviewCount = verifications.filter(isReview).length;
    const angleMismatchCount = verifications.filter(angleMismatch).length;
    const barcodeMismatchCount = verifications.filter(v => v.barcodeMatch === false).length;

    const fakeRate = total ? Math.round((fakeCount / total) * 100) : 0;

    const topFakeMap = {};

    verifications
      .filter(isFake)
      .forEach(v => {
        const name = v.productName || `Продукт #${v.productId}`;
        topFakeMap[name] = (topFakeMap[name] || 0) + 1;
      });

    const topFakeProducts = Object.entries(topFakeMap)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const last7Days = [...Array(7)].map((_, index) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - index));

      const key = d.toISOString().slice(0, 10);

      const count = verifications.filter(v => {
        const date = getDate(v);
        if (!date) return false;
        return new Date(date).toISOString().slice(0, 10) === key;
      }).length;

      return {
        label: d.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' }),
        count,
      };
    });

    const recent = [...verifications]
      .sort((a, b) => new Date(getDate(b) || 0) - new Date(getDate(a) || 0))
      .slice(0, 7);

    return {
      total,
      fakeCount,
      originalCount,
      reviewCount,
      angleMismatchCount,
      barcodeMismatchCount,
      fakeRate,
      topFakeProducts,
      last7Days,
      recent,
    };
  }, [verifications]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}>
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Аналитика проверок AntiFakeAI"
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: 14,
          marginBottom: 22,
        }}
      >
        <MetricCard
          label="Всего проверок"
          value={analytics.total}
          icon={Activity}
          color="var(--accent)"
        />

        <MetricCard
          label="Требуют проверки"
          value={analytics.reviewCount}
          icon={Search}
          color="var(--yellow)"
        />

        <MetricCard
          label="Оригиналы"
          value={analytics.originalCount}
          icon={ShieldCheck}
          color="var(--green)"
        />

        <MetricCard
          label="Подделки"
          value={analytics.fakeCount}
          icon={ShieldX}
          color="var(--red)"
        />

        <MetricCard
          label="Пользователи"
          value={usersCount}
          icon={Users}
          color="var(--accent)"
        />

        <MetricCard
          label="Продукты"
          value={productsCount}
          icon={Package}
          color="var(--accent)"
        />

        <MetricCard
          label="Бренды"
          value={brandsCount}
          icon={Tags}
          color="var(--accent)"
        />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.1fr 0.9fr',
          gap: 16,
          marginBottom: 16,
        }}
      >
        <Card>
          <SectionTitle
            icon={BarChart3}
            title="Распределение результатов"
            subtitle="Общее соотношение оригиналов, подделок и заявок на проверку"
          />

          <DistributionBar
            original={analytics.originalCount}
            fake={analytics.fakeCount}
            review={analytics.reviewCount}
            total={analytics.total}
          />

          <div
            style={{
              marginTop: 18,
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 10,
            }}
          >
            <MiniStat label="Доля подделок" value={`${analytics.fakeRate}%`} color="var(--red)" />
            <MiniStat label="Проблемы ракурса" value={analytics.angleMismatchCount} color="var(--yellow)" />
            <MiniStat label="Баркод не совпал" value={analytics.barcodeMismatchCount} color="var(--red)" />
          </div>
        </Card>

        <Card>
          <SectionTitle
            icon={TrendingUp}
            title="Активность за 7 дней"
            subtitle="Количество заявок по дням"
          />

          <WeeklyChart data={analytics.last7Days} />
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '0.85fr 1.15fr',
          gap: 16,
        }}
      >
        <Card>
          <SectionTitle
            icon={ShieldX}
            title="Топ товаров по подделкам"
            subtitle="3 товара, которые чаще всего определялись как подделка"
          />

          <TopFakeProducts data={analytics.topFakeProducts} />
        </Card>

        <Card>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
            }}
          >
            <SectionTitle
              icon={Activity}
              title="Последние заявки"
              subtitle="Недавние проверки пользователей"
              noMargin
            />

            <button
              onClick={() => navigate('/admin/verifications')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'var(--font)',
              }}
            >
              Смотреть все →
            </button>
          </div>

          <RecentList data={analytics.recent} navigate={navigate} />
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <Card
      style={{
        padding: 18,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          background: 'var(--bg-4)',
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color,
        }}
      >
        <Icon size={22} strokeWidth={2.2} />
      </div>

      <div>
        <div
          style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}
        >
          {value}
        </div>

        <div
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginTop: 2,
          }}
        >
          {label}
        </div>
      </div>
    </Card>
  );
}

function SectionTitle({ icon: Icon, title, subtitle, noMargin }) {
  return (
    <div style={{ marginBottom: noMargin ? 0 : 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Icon size={17} color="var(--accent)" />

        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </h2>
      </div>

      {subtitle && (
        <p
          style={{
            fontSize: 12,
            color: 'var(--text-3)',
            marginTop: 4,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div
      style={{
        background: 'var(--bg-3)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 12,
      }}
    >
      <div
        style={{
          fontSize: 18,
          fontWeight: 800,
          color,
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: 11.5,
          color: 'var(--text-3)',
          marginTop: 3,
        }}
      >
        {label}
      </div>
    </div>
  );
}

function DistributionBar({ original, fake, review, total }) {
  const safeTotal = total || 1;

  const originalWidth = (original / safeTotal) * 100;
  const fakeWidth = (fake / safeTotal) * 100;
  const reviewWidth = (review / safeTotal) * 100;

  return (
    <div>
      <div
        style={{
          height: 14,
          borderRadius: 999,
          overflow: 'hidden',
          background: 'var(--bg-4)',
          display: 'flex',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ width: `${originalWidth}%`, background: 'var(--green)' }} />
        <div style={{ width: `${fakeWidth}%`, background: 'var(--red)' }} />
        <div style={{ width: `${reviewWidth}%`, background: 'var(--yellow)' }} />
      </div>

      <div
        style={{
          display: 'flex',
          gap: 14,
          marginTop: 12,
          flexWrap: 'wrap',
          fontSize: 12,
          color: 'var(--text-2)',
        }}
      >
        <Legend color="var(--green)" label={`Оригиналы: ${original}`} />
        <Legend color="var(--red)" label={`Подделки: ${fake}`} />
        <Legend color="var(--yellow)" label={`На проверке: ${review}`} />
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span
        style={{
          width: 8,
          height: 8,
          borderRadius: 999,
          background: color,
        }}
      />
      {label}
    </div>
  );
}

function WeeklyChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'end',
        gap: 10,
        height: 180,
        paddingTop: 20,
      }}
    >
      {data.map((d) => (
        <div
          key={d.label}
          style={{
            flex: 1,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'end',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <div
            style={{
              fontSize: 11,
              color: 'var(--text-3)',
              fontFamily: 'var(--mono)',
            }}
          >
            {d.count}
          </div>

          <div
            title={`${d.label}: ${d.count}`}
            style={{
              width: '100%',
              maxWidth: 32,
              height: `${Math.max((d.count / max) * 120, d.count > 0 ? 14 : 4)}px`,
              background: 'var(--accent)',
              borderRadius: '8px 8px 3px 3px',
              opacity: d.count > 0 ? 1 : 0.25,
            }}
          />

          <div
            style={{
              fontSize: 10.5,
              color: 'var(--text-3)',
              whiteSpace: 'nowrap',
            }}
          >
            {d.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function TopFakeProducts({ data }) {
  if (!data.length) {
    return (
      <div
        style={{
          padding: '34px 0',
          textAlign: 'center',
          color: 'var(--text-3)',
          fontSize: 13,
        }}
      >
        Пока нет товаров, отмеченных как подделка
      </div>
    );
  }

  const max = Math.max(...data.map(d => d.count), 1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {data.map((item, index) => (
        <div key={item.name}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              gap: 12,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {index + 1}. {item.name}
            </div>

            <Badge color="red" size="sm">
              {item.count}
            </Badge>
          </div>

          <div
            style={{
              height: 7,
              borderRadius: 999,
              background: 'var(--bg-4)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${(item.count / max) * 100}%`,
                height: '100%',
                background: 'var(--red)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecentList({ data, navigate }) {
  if (!data.length) {
    return (
      <p style={{ color: 'var(--text-3)', textAlign: 'center', padding: '28px 0' }}>
        Нет заявок
      </p>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {data.map((v, i) => (
        <button
          key={v.requestId ?? i}
          onClick={() =>
            navigate('/admin/verifications', {
              state: {
                openTab: 'all',
                openRequestId: v.requestId,
              },
            })
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '11px 0',
            border: 'none',
            borderBottom: i < data.length - 1 ? '1px solid var(--border)' : 'none',
            background: 'transparent',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'var(--font)',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: 13,
                color: 'var(--text)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {v.productName || `Продукт #${v.productId}`}
            </div>

            <div
              style={{
                fontSize: 11,
                color: 'var(--text-3)',
                marginTop: 3,
              }}
            >
              #{v.requestId} · {formatDate(getDate(v))}
            </div>

            {v.selectedAngle && (
              <div
                style={{
                  fontSize: 11,
                  color: angleMismatch(v) ? 'var(--yellow)' : 'var(--text-3)',
                  marginTop: 3,
                }}
              >
                {angleMismatch(v)
                  ? 'Ракурс не совпадает'
                  : `Ракурс: ${v.selectedAngle}`}
              </div>
            )}
          </div>

          <Badge color={resultColor(v)} size="sm">
            {resultLabel(v)}
          </Badge>
        </button>
      ))}
    </div>
  );
}