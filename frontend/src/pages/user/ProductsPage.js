import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI, brandsAPI, countriesAPI } from '../../api/services';
import { Badge, Skeleton, Modal, Btn } from '../../components/ui';

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState(searchParams.get('brandId') || '');
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [countryFilter, setCountryFilter] = useState('');

  useEffect(() => {
    Promise.all([brandsAPI.getAll(), countriesAPI.getAll()])
      .then(([b, c]) => { setBrands(b.data || []); setCountries(c.data || []); });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (search.trim()) res = await productsAPI.search(search.trim());
      else if (brandFilter) res = await productsAPI.getByBrand(brandFilter);
      else if (countryFilter) res = await productsAPI.getByCountry(countryFilter);
      else res = await productsAPI.getAll();
      setProducts(res.data || []);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [search, brandFilter, countryFilter]);

  useEffect(() => {
    const t = setTimeout(load, search ? 320 : 0);
    return () => clearTimeout(t);
  }, [load, search]);

  const openDetail = async (id) => {
    setDetailLoading(true);
    setDetail({ id });
    try {
      const res = await productsAPI.getById(id);
      setDetail(res.data);
    } catch { setDetail(null); }
    finally { setDetailLoading(false); }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em' }}>Продукты</h1>
          <p style={{ color: 'var(--text-3)', marginTop: 3, fontSize: '13px' }}>Каталог товаров для проверки подлинности</p>
        </div>
        <Btn onClick={() => navigate('/verify')} size="sm">
          + Проверить товар
        </Btn>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: '1 1 220px' }}>
          <span style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', fontSize: 14 }}>🔍</span>
          <input type="text" placeholder="Поиск по названию или бренду..."
            value={search} onChange={e => { setSearch(e.target.value); setBrandFilter(''); }}
            style={{
              width: '100%', background: 'var(--bg-3)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: '8px 12px 8px 34px', color: 'var(--text)',
              fontSize: '13.5px', outline: 'none', fontFamily: 'var(--font)',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--border-active)'; e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setSearch(''); }}
          style={{
            background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
            padding: '8px 12px', color: brandFilter ? 'var(--text)' : 'var(--text-3)',
            fontSize: '13.5px', outline: 'none', fontFamily: 'var(--font)', cursor: 'pointer',
            flex: '0 0 auto',
          }}>
          <option value="">Все бренды</option>
          {brands.map((b) => {
  const id = b.brandId || b.id;

  return (
    <option key={id} value={id}>
      {b.name || b.brandName}
    </option>
  );
})}
        </select>

        <select
  value={countryFilter}
  onChange={(e) => {
    setCountryFilter(e.target.value);
    setSearch('');
    setBrandFilter('');
  }}
  style={{
    background: 'var(--bg-3)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '8px 12px',
    color: countryFilter ? 'var(--text)' : 'var(--text-3)',
    fontSize: '13.5px',
    outline: 'none',
    fontFamily: 'var(--font)',
    cursor: 'pointer',
  }}
>
  <option value="">Все страны</option>
  {countries.map((c) => (
    <option key={c.countryId || c.id} value={c.countryId || c.id}>
      {c.countryName || c.name}
    </option>
  ))}
</select>

        {(search || brandFilter) && (
          <button onClick={() => { setSearch(''); setBrandFilter('');     setCountryFilter('');}}
            style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '8px 12px', color: 'var(--text-2)', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font)' }}>
            Сбросить
          </button>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <div style={{ marginBottom: 16, fontSize: '12.5px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
          {products.length} {products.length === 1 ? 'продукт' : 'продуктов'}
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {[...Array(8)].map((_, i) => <Skeleton key={i} height={160} radius={8} />)}
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: '40px', marginBottom: 12 }}>📦</div>
          <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: 6 }}>Продукты не найдены</h3>
          <p style={{ color: 'var(--text-3)', fontSize: '13.5px' }}>Попробуйте изменить фильтры</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {products.map((p) => {
  const id = p.productId || p.id;

  return (
    <ProductCard
      key={id}
      product={p}
      onClick={() => openDetail(id)}
    />
  );
})}
        </div>
      )}

      {/* Detail modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title="Информация о товаре" width={560}>
        {detailLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => <Skeleton key={i} height={20} />)}
          </div>
        ) : detail && !detailLoading ? (
          <ProductDetail
  product={detail}
  onVerify={() => {
    const id = detail.productId || detail.id;
    setDetail(null);
    navigate(`/verify?productId=${id}`);
  }}
/>
        ) : null}
      </Modal>
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hov ? 'var(--border-active)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        transition: 'all var(--transition)',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 8px 20px rgba(0,0,0,0.3)' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 100,
          borderRadius: 6,
          background: 'var(--bg-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 32,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name || product.productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          '📦'
        )}
      </div>

      <div
        style={{
          fontWeight: 500,
          fontSize: '13.5px',
          marginBottom: 4,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {product.name || product.productName}
      </div>

      {product.brandName && (
        <div
          style={{
            fontSize: '11.5px',
            color: 'var(--text-3)',
            fontFamily: 'var(--mono)',
          }}
        >
          {product.brandName}
        </div>
      )}

      {product.volume && (
        <div style={{ marginTop: 6 }}>
          <Badge color="default" size="sm">
            {product.volume.replace('ML_', '') + ' мл'}
          </Badge>
        </div>
      )}

      <div style={{ marginTop: 12 }}>
        <Btn fullWidth size="sm" variant="secondary" onClick={onClick}>
          Подробнее
        </Btn>
      </div>
    </div>
  );
}

function ProductDetail({ product, onVerify }) {
  const fields = [
    { label: 'Название', value: product.name || product.productName },
    { label: 'Бренд', value: product.brandResponse?.name || product.brandName },
    { label: 'Страна производства', value: product.countryName || product.country },
    {
      label: 'Объём',
      value: product.volume ? product.volume.replace('ML_', '') + ' мл' : null,
    },
    { label: 'Штрих-код', value: product.barcode, mono: true },
    { label: 'Описание', value: product.description },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {product.mainImageUrl && (
        <div
          style={{
            width: '100%',
            height: 220,
            borderRadius: 12,
            overflow: 'hidden',
            background: 'var(--bg-4)',
          }}
        >
          <img
            src={product.mainImageUrl}
            alt={product.name || product.productName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {fields.filter((f) => f.value).map((f) => (
          <div
            key={f.label}
            style={{
              background: 'var(--bg-3)',
              borderRadius: 6,
              padding: '12px',
              gridColumn: f.label === 'Описание' ? 'span 2' : 'auto',
            }}
          >
            <div
              style={{
                fontSize: '10.5px',
                color: 'var(--text-3)',
                fontFamily: 'var(--mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: 4,
              }}
            >
              {f.label}
            </div>

            <div
              style={{
                fontSize: '13.5px',
                fontFamily: f.mono ? 'var(--mono)' : 'var(--font)',
                color: 'var(--text)',
                lineHeight: 1.5,
              }}
            >
              {f.value}
            </div>
          </div>
        ))}
      </div>

      <Btn fullWidth onClick={onVerify} size="lg">
        🔍 Проверить этот товар
      </Btn>
    </div>
  );

}