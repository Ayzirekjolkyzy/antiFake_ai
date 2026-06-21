import { useEffect, useState, useCallback } from 'react';
import { brandsAPI, countriesAPI } from '../../../api/services';
import {
  Btn,
  Table,
  Modal,
  Input,
  Select,
  PageHeader,
  Card,
  useConfirm,
  toast,
  Badge
} from '../../../components/ui';

const emptyForm = {
  brandName: '',
  countryId: '',
  officialWebsite: '',
  logoUrl: '',
  description: '',
  isHighRisk: false,
};

function LogoImage({ src, alt, size = 42 }) {
  if (!src) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size > 100 ? 16 : 8,
          border: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-2)',
          background: '#fff',
          fontSize: 12,
        }}
      >
        —
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt || 'logo'}
      onError={(e) => {
        e.target.src =
          'https://via.placeholder.com/300x300?text=No+Logo';
      }}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        borderRadius: size > 100 ? 16 : 8,
        border: '1px solid var(--border)',
        background: '#fff',
        padding: size > 100 ? 20 : 6,
        display: 'block',
      }}
    />
  );
}

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [detailsBrand, setDetailsBrand] = useState(null);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const { confirm, Dialog } = useConfirm();

  const getCountryName = (countryId) =>
    countries.find((c) => String(c.countryId) === String(countryId))
      ?.countryName || '—';

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [b, c] = await Promise.all([
        brandsAPI.getAll(),
        countriesAPI.getAll(),
      ]);

      setBrands(b.data || []);
      setCountries(c.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setForm(emptyForm);
    setModal('create');
  };

  const openEdit = (brand) => {
    setForm({
      brandName: brand.name || '',
      countryId: brand.countryId || '',
      officialWebsite: brand.officialWebsite || '',
      logoUrl: brand.logoUrl || '',
      description: brand.description || '',
      isHighRisk: Boolean(brand.isHighRisk),
    });

    setModal({
      ...brand,
      id: brand.brandId,
    });
  };

  const openDetails = async (id) => {
    try {
      const res = await brandsAPI.getById(id);
      setDetailsBrand(res.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка загрузки бренда');
    }
  };

  const handleSearch = async (q) => {
    setSearch(q);
    setCountryFilter('');

    if (!q.trim()) {
      load();
      return;
    }

    setLoading(true);

    try {
      const res = await brandsAPI.search(q);
      setBrands(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка поиска');
    } finally {
      setLoading(false);
    }
  };

  const handleCountryFilter = async (countryId) => {
    setCountryFilter(countryId);
    setSearch('');

    if (!countryId) {
      load();
      return;
    }

    setLoading(true);

    try {
      const res = await brandsAPI.getByCountry(countryId);
      setBrands(res.data || []);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка фильтрации');
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setSearch('');
    setCountryFilter('');
    load();
  };

  const handleSubmit = async () => {
    if (!form.brandName.trim()) {
      toast.error('Введите название бренда');
      return;
    }

    if (!form.countryId) {
      toast.error('Выберите страну бренда');
      return;
    }

    setSubmitting(true);

    const payload = {
      brandName: form.brandName,
      countryId: form.countryId,
      officialWebsite: form.officialWebsite,
      logoUrl: form.logoUrl,
      description: form.description,
      isHighRisk: form.isHighRisk,
    };

    try {
      if (modal === 'create') {
        await brandsAPI.create(payload);
        toast.success('Бренд создан');
      } else {
        await brandsAPI.update(modal.id, payload);
        toast.success('Бренд обновлён');
      }

      setModal(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm(
      `Удалить бренд "${name}"?`
    );

    if (!ok) return;

    try {
      await brandsAPI.delete(id);
      toast.success('Бренд удалён');
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка удаления');
    }
  };

  return (
    <div>
      <PageHeader
        title="Бренды"
        subtitle={`${brands.length} брендов в базе`}
        action={
          <Btn onClick={openCreate}>
            + Новый бренд
          </Btn>
        }
      />

      <Card style={{ marginBottom: 16, padding: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <Input
            label="Поиск"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Поиск бренда..."
          />

          <Select
            label="Страна бренда"
            value={countryFilter}
            onChange={(e) => handleCountryFilter(e.target.value)}
          >
            <option value="">Все страны</option>

            {countries.map((c) => (
              <option key={c.countryId} value={c.countryId}>
                {c.countryName}
              </option>
            ))}
          </Select>

          <Btn variant="secondary" onClick={resetFilters}>
            Сбросить
          </Btn>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          loading={loading}
          emptyText="Нет брендов"
          data={brands}
          columns={[
            {
              key: 'brandId',
              title: 'ID',
              width: 60,
            },
            {
              key: 'logoUrl',
              title: 'Лого',
              width: 90,
              render: (v, row) => (
                <LogoImage
                  src={v}
                  alt={row.name}
                />
              ),
            },
            {
              key: 'name',
              title: 'Название',
              render: (v) => <strong>{v}</strong>,
            },
            {
              key: 'countryId',
              title: 'Страна',
              render: (v) => getCountryName(v),
            },
            {
              key: 'officialWebsite',
              title: 'Сайт',
              render: (v) =>
                v ? (
                  <a href={v} target="_blank" rel="noreferrer">
                    Открыть
                  </a>
                ) : (
                  '—'
                ),
            },
            {
              key: 'isHighRisk',
              title: 'Риск',
              render: (v) =>
                v ? (
                  <Badge color="red">
                    Часто подделывают
                  </Badge>
                ) : (
                  <Badge color="green">
                    Обычный
                  </Badge>
                ),
            },
            {
              key: '_',
              title: '',
              width: 180,
              render: (_, row) => (
                <div style={{ display: 'flex', gap: 6 }}>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => openDetails(row.brandId)}
                  >
                    Подробнее
                  </Btn>

                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() => openEdit(row)}
                  >
                    Изменить
                  </Btn>

                  <Btn
                    size="sm"
                    variant="danger"
                    onClick={() =>
                      handleDelete(row.brandId, row.name)
                    }
                  >
                    ✕
                  </Btn>
                </div>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal === 'create'
            ? 'Новый бренд'
            : `Изменить: ${modal?.name}`
        }
        width={560}
      >
      <div
        style={{
          maxHeight: '72vh',
          overflowY: 'auto',
          paddingRight: 6,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Input
            label="Название бренда *"
            value={form.brandName}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                brandName: e.target.value,
              }))
            }
          />

          <Select
            label="Страна бренда *"
            value={form.countryId}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                countryId: e.target.value,
              }))
            }
          >
            <option value="">
              — Выберите страну —
            </option>

            {countries.map((c) => (
              <option
                key={c.countryId}
                value={c.countryId}
              >
                {c.countryName}
              </option>
            ))}
          </Select>

          <Input
            label="Официальный сайт"
            value={form.officialWebsite}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                officialWebsite: e.target.value,
              }))
            }
          />

          <Input
            label="Логотип URL"
            value={form.logoUrl}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                logoUrl: e.target.value,
              }))
            }
          />

          {form.logoUrl && (
            <div>
              <div
                style={{
                  marginBottom: 8,
                  fontSize: 12,
                  color: 'var(--text-2)',
                }}
              >
                Предпросмотр логотипа
              </div>

              <LogoImage
                src={form.logoUrl}
                alt="preview"
                size={120}
              />
            </div>
          )}

          <Select
            label="Риск подделки"
            value={form.isHighRisk ? 'true' : 'false'}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                isHighRisk:
                  e.target.value === 'true',
              }))
            }
          >
            <option value="false">
              Обычный бренд
            </option>

            <option value="true">
              Часто подделывают
            </option>
          </Select>

          <textarea
            value={form.description}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                description: e.target.value,
              }))
            }
            placeholder="Описание бренда..."
            style={{
              width: '100%',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '9px 12px',
              color: 'var(--text)',
              fontSize: 14,
              outline: 'none',
              resize: 'vertical',
              minHeight: 90,
            }}
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
              onClick={() => setModal(null)}
            >
              Отмена
            </Btn>

            <Btn
              loading={submitting}
              onClick={handleSubmit}
            >
              {modal === 'create'
                ? 'Создать'
                : 'Сохранить'}
            </Btn>
          </div>
        </div>
        </div>
      </Modal>

      <Modal
        open={!!detailsBrand}
        onClose={() => setDetailsBrand(null)}
        title={
          detailsBrand?.name ||
          'Информация о бренде'
        }
        width={700}
      >
        {detailsBrand && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 20,
              }}
            >
              <LogoImage
                src={detailsBrand.logoUrl}
                alt={detailsBrand.name}
                size={180}
              />

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                }}
              >
                <InfoItem
                  label="Название"
                  value={detailsBrand.name}
                />

                <InfoItem
                  label="Страна"
                  value={getCountryName(
                    detailsBrand.countryId
                  )}
                />

                <InfoItem
                  label="Риск"
                  value={
                    detailsBrand.isHighRisk
                      ? 'Часто подделывают'
                      : 'Обычный'
                  }
                />

                <InfoItem
                  label="Сайт"
                  value={
                    detailsBrand.officialWebsite ||
                    '—'
                  }
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--text-2)',
                  marginBottom: 8,
                }}
              >
                Описание
              </div>

              <div
                style={{
                  background: 'var(--bg-2)',
                  padding: 16,
                  borderRadius: 12,
                  lineHeight: 1.6,
                  border:
                    '1px solid var(--border)',
                }}
              >
                {detailsBrand.description ||
                  'Описание отсутствует'}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <Dialog />
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--text-2)',
        }}
      >
        {label}
      </div>

      <strong>{value}</strong>
    </div>
  );
}