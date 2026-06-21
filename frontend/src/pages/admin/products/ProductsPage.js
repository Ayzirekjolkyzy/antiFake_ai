import { useEffect, useState, useCallback } from 'react';
import { productsAPI, brandsAPI, countriesAPI } from '../../../api/services';
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
import { useNavigate } from 'react-router-dom';

const VOLUMES = [
  'ML_10',
  'ML_15',
  'ML_20',
  'ML_25',
  'ML_30',
  'ML_50',
  'ML_75',
  'ML_100',
  'ML_125',
  'ML_150',
  'ML_175',
  'ML_200',
  'ML_250',
  'ML_300',
  'ML_350',
  'ML_400',
  'ML_450',
  'ML_500'
];

const emptyForm = {
  productName: '',
  description: '',
  barcode: '',
  brandId: '',
  countryId: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [countryFilter, setCountryFilter] = useState('');

  const [modal, setModal] = useState(null);
  const [detailsProduct, setDetailsProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);
  const [volume, setVolume] = useState('ML_50');
  const [mainImage, setMainImage] = useState(null);

  const { confirm, Dialog } = useConfirm();
  const navigate = useNavigate();

  const getCountryName = (countryId) => {
    return (
      countries.find(
        (c) => String(c.countryId) === String(countryId)
      )?.countryName || '—'
    );
  };

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [p, b, c] = await Promise.all([
        productsAPI.getAll(),
        brandsAPI.getAll(),
        countriesAPI.getAll()
      ]);

      setProducts(p.data || []);
      setBrands(b.data || []);
      setCountries(c.data || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка загрузки'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const resetFilters = async () => {
    setSearch('');
    setCountryFilter('');
    await load();
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
      const res = await productsAPI.getByCountry(countryId);
      setProducts(res.data || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка фильтрации по стране'
      );
    } finally {
      setLoading(false);
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
      const res = await productsAPI.search(q);
      setProducts(res.data || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка поиска'
      );
    } finally {
      setLoading(false);
    }
  };

  const setF = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleBrandChange = (e) => {
    const brandId = e.target.value;

    setForm((prev) => ({
      ...prev,
      brandId,
    }));
  };

  const openCreate = () => {
    setForm(emptyForm);
    setMainImage(null);
    setVolume('ML_50');
    setModal('create');
  };

  const openEdit = async (p) => {
    try {
      const res = await productsAPI.getById(p.productId);
      const product = res.data;

      setForm({
        productName: product.name || '',
        description: product.description || '',
        barcode: product.barcode || '',
        brandId: product.brandResponse?.brandId || '',
        countryId: product.countryId || '',
      });

      setMainImage(null);
      setVolume(product.volume || 'ML_50');

      setModal({
        ...product,
        id: product.productId,
      });
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка загрузки продукта'
      );
    }
  };

  const handleSubmit = async () => {
    if (!form.productName.trim()) {
      toast.error('Введите название');
      return;
    }

    if (!form.brandId) {
      toast.error('Выберите бренд');
      return;
    }

    if (!form.countryId) {
      toast.error('Выберите страну производства продукта');
      return;
    }

    if (!form.barcode.trim()) {
      toast.error('Введите штрих-код');
      return;
    }

    setSubmitting(true);

    try {
      if (modal === 'create') {
        if (!mainImage) {
          toast.error('Выберите главное фото');
          return;
        }

        const data = new FormData();

        data.append('productName', form.productName);
        data.append('barcode', form.barcode);
        data.append('description', form.description);
        data.append('brandId', form.brandId);
        data.append('countryId', form.countryId);
        data.append('volume', volume);
        data.append('mainImage', mainImage);

        await productsAPI.create(data);

        toast.success('Продукт создан');
      } else {
        await productsAPI.update(
          modal.id,
          {
            productName: form.productName,
            barcode: form.barcode,
            description: form.description,
            brand_id: form.brandId,
            countryId: form.countryId,
          },
          volume
        );

        if (mainImage) {
          const imageData = new FormData();
          imageData.append('mainImage', mainImage);

          await productsAPI.updateMainImage(
            modal.id,
            imageData
          );
        }

        toast.success('Продукт обновлён');
      }

      setModal(null);
      load();
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openDetails = async (id) => {
    try {
      const res = await productsAPI.getById(id);
      setDetailsProduct(res.data);
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка загрузки продукта'
      );
    }
  };

  const handleDelete = async (id, name) => {
    const ok = await confirm(
      `Удалить продукт "${name}"?`
    );

    if (!ok) return;

    try {
      await productsAPI.delete(id);
      toast.success('Продукт удалён');
      load();
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка при удалении'
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Продукты"
        subtitle={`${products.length} продуктов в базе`}
        action={
          <Btn onClick={openCreate}>
            + Новый продукт
          </Btn>
        }
      />

      <Card
        style={{
          marginBottom: 16,
          padding: 16,
        }}
      >
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
            placeholder="Поиск по названию или бренду..."
          />

          <Select
            label="Страна производства"
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

          <Btn
            variant="secondary"
            onClick={resetFilters}
          >
            Сбросить
          </Btn>
        </div>
      </Card>

      <Card
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <Table
          loading={loading}
          emptyText="Нет продуктов"
          data={products}
          columns={[
            {
              key: 'productId',
              title: 'ID',
              width: 60,
            },
            {
              key: 'mainImageUrl',
              title: 'Фото',
              width: 90,
              render: (_, row) =>
                row.mainImageUrl ? (
                  <img
                    src={row.mainImageUrl}
                    alt={row.name}
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 8,
                      border: '1px solid var(--border)',
                    }}
                  />
                ) : (
                  '—'
                ),
            },
            {
              key: 'name',
              title: 'Название',
              render: (v) => (
                <strong style={{ fontSize: 13 }}>
                  {v}
                </strong>
              ),
            },
            {
              key: 'brandName',
              title: 'Бренд',
              render: (v) => v || '—',
            },
            {
              key: 'barcode',
              title: 'Штрих-код',
              render: (v) =>
                v ? (
                  <span
                    style={{
                      fontFamily: 'var(--mono)',
                      fontSize: 12,
                    }}
                  >
                    {v}
                  </span>
                ) : (
                  '—'
                ),
            },
            {
              key: 'countryId',
              title: 'Страна продукта',
              render: (v) => getCountryName(v),
            },
            {
              key: 'volume',
              title: 'Объём',
              render: (v) =>
                v ? (
                  <Badge color="blue">
                    {v.replace('ML_', '') + ' ml'}
                  </Badge>
                ) : (
                  '—'
                ),
            },
            {
              key: '_',
              title: '',
              width: 190,
              render: (_, row) => (
                <div
                  style={{
                    display: 'flex',
                    gap: 6,
                    flexWrap: 'wrap',
                  }}
                >
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => openDetails(row.productId)}
                  >
                    Подробнее
                  </Btn>

                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      navigate(`/admin/images?productId=${row.productId}`)
                    }
                  >
                    🖼
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
                      handleDelete(row.productId, row.name)
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
            ? 'Новый продукт'
            : `Изменить: ${modal?.name}`
        }
        width={560}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <Input
            label="Название *"
            value={form.productName}
            onChange={setF('productName')}
            placeholder="Например: Dior Sauvage"
          />

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
            }}
          >
            <Select
              label="Бренд *"
              value={form.brandId}
              onChange={handleBrandChange}
            >
              <option value="">
                — Выберите бренд —
              </option>

              {brands.map((b) => (
                <option key={b.brandId} value={b.brandId}>
                  {b.name}
                </option>
              ))}
            </Select>

            <Select
              label="Страна производства *"
              value={form.countryId}
              onChange={setF('countryId')}
            >
              <option value="">
                — Выберите страну —
              </option>

              {countries.map((c) => (
                <option key={c.countryId} value={c.countryId}>
                  {c.countryName}
                </option>
              ))}
            </Select>

            <Select
              label="Объём"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
            >
              {VOLUMES.map((v) => (
                <option key={v} value={v}>
                  {v.replace('ML_', '') + ' ml'}
                </option>
              ))}
            </Select>

            <Input
              label="Штрих-код *"
              value={form.barcode}
              onChange={setF('barcode')}
              placeholder="0123456789012"
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-2)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Главное фото {modal === 'create' ? '*' : ''}
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setMainImage(e.target.files?.[0] || null)
              }
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-2)',
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: 6,
              }}
            >
              Описание
            </label>

            <textarea
              value={form.description}
              onChange={setF('description')}
              placeholder="Описание продукта..."
              style={{
                width: '100%',
                background: 'var(--bg-3)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '9px 12px',
                color: 'var(--text)',
                fontSize: 14,
                outline: 'none',
                fontFamily: 'var(--font)',
                resize: 'vertical',
                minHeight: 80,
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
              paddingTop: 4,
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
              {modal === 'create' ? 'Создать' : 'Сохранить'}
            </Btn>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!detailsProduct}
        onClose={() => setDetailsProduct(null)}
        title={detailsProduct?.name || 'Информация о продукте'}
        width={700}
      >
        {detailsProduct && (
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
              {detailsProduct.mainImageUrl ? (
                <img
                  src={detailsProduct.mainImageUrl}
                  alt={detailsProduct.name}
                  style={{
                    width: 220,
                    height: 220,
                    objectFit: 'cover',
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 220,
                    height: 220,
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--text-2)',
                  }}
                >
                  Нет фото
                </div>
              )}

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  flex: 1,
                }}
              >
                <InfoItem
                  label="Название"
                  value={detailsProduct.name}
                />

                <InfoItem
                  label="Бренд"
                  value={detailsProduct.brandResponse?.name || '—'}
                />

                <InfoItem
                  label="Штрих-код"
                  value={detailsProduct.barcode || '—'}
                />

                <InfoItem
                  label="Страна производства продукта"
                  value={getCountryName(detailsProduct.countryId)}
                />

                <div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-2)',
                    }}
                  >
                    Объём
                  </div>

                  {detailsProduct.volume ? (
                    <Badge color="blue">
                      {detailsProduct.volume.replace('ML_', '')} ml
                    </Badge>
                  ) : (
                    <strong>—</strong>
                  )}
                </div>

                <InfoItem
                  label="Создан"
                  value={
                    detailsProduct.createdAt
                      ? new Date(detailsProduct.createdAt).toLocaleString()
                      : '—'
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
                  border: '1px solid var(--border)',
                }}
              >
                {detailsProduct.description || 'Описание отсутствует'}
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

      <strong>
        {value}
      </strong>
    </div>
  );
}