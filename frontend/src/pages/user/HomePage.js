import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productsAPI, brandsAPI, usersAPI } from '../../api/services';
import { Badge, Skeleton } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [brands, setBrands] = useState([]);
  const [products, setProducts] = useState([]);
  const [loadingHome, setLoadingHome] = useState(true);

const [profile, setProfile] = useState(null);

const username =
  profile?.username ||
  profile?.name ||
  profile?.email ||
  'Пользователь';

useEffect(() => {

  Promise.all([
    brandsAPI.getAll(),
    productsAPI.getAll(),
    usersAPI.getMe()
  ])
    .then(([b, p, u]) => {

      setBrands((b.data || []).slice(0, 8));
      setProducts((p.data || []).slice(0, 6));

      setProfile(u.data);

    })
    .finally(() => setLoadingHome(false));

}, []);

  useEffect(() => {
    if (!search.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await productsAPI.search(search.trim());
        setResults(res.data || []);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 320);

    return () => clearTimeout(timer);
  }, [search]);

  const openProduct = (product) => {
    const id = product.productId || product.id;
    if (!id) return;
    navigate(`/products?productId=${id}`);
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s ease' }}>
      <div
        style={{
          background: 'var(--bg-2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          marginBottom: 28,
          position: 'relative',
          overflow: 'visible',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: 'linear-gradient(90deg, var(--accent) 0%, transparent 60%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 240,
            height: 240,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(43,138,255,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative' }}>
          <p
            style={{
              fontSize: '11.5px',
              fontFamily: 'var(--mono)',
              color: 'var(--accent)',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              marginBottom: 8,
            }}
          >
            Добро пожаловать
          </p>

          <h1
            style={{
              fontSize: '26px',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              marginBottom: 6,
            }}
          >
            Привет, {username.split('@')[0]} 👋
          </h1>

          <p
            style={{
              color: 'var(--text-2)',
              fontSize: '14px',
              marginBottom: 24,
              lineHeight: 1.6,
            }}
          >
            Проверяйте подлинность товаров с помощью ИИ. Загрузите фото — получите результат за секунды.
          </p>

          <div style={{ position: 'relative', maxWidth: 520 }}>
            <span
              style={{
                position: 'absolute',
                left: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-3)',
                fontSize: 16,
                zIndex: 1,
              }}
            >
              🔍
            </span>

            <input
              type="text"
              placeholder="Поиск продукта или бренда..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--bg-3)',
                border: '1px solid var(--border-active)',
                borderRadius: 8,
                padding: '11px 14px 11px 40px',
                color: 'var(--text)',
                fontSize: '14px',
                outline: 'none',
                fontFamily: 'var(--font)',
                transition: 'border-color var(--transition), box-shadow var(--transition)',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--accent)';
                e.target.style.boxShadow = '0 0 0 3px var(--accent-subtle)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--border-active)';
                e.target.style.boxShadow = 'none';
              }}
            />

            {searching && (
              <span
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              >
                ⏳
              </span>
            )}

            {results.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 6px)',
                  left: 0,
                  right: 0,
                  background: 'var(--bg-2)',
                  border: '1px solid var(--border-active)',
                  borderRadius: 8,
                  boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  maxHeight: 320,
                  overflowY: 'auto',
                }}
              >
                {results.slice(0, 8).map((p) => {
                  const id = p.productId || p.id;

                  return (
                    <button
                      key={id}
                      onClick={() => openProduct(p)}
                      style={{
                        width: '100%',
                        padding: '11px 14px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                        transition: 'background var(--transition)',
                        fontFamily: 'var(--font)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--bg-3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent';
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 6,
                          background: 'var(--bg-4)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16,
                          flexShrink: 0,
                          overflow: 'hidden',
                        }}
                      >
                        {p.mainImageUrl ? (
                          <img
                            src={p.mainImageUrl}
                            alt={p.name || p.productName}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          '📦'
                        )}
                      </div>

                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13.5px' }}>
                          {p.name || p.productName}
                        </div>

                        {p.brandName && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: 'var(--text-3)',
                              fontFamily: 'var(--mono)',
                              marginTop: 1,
                            }}
                          >
                            {p.brandName}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {results.length > 8 && (
                  <div
                    style={{
                      padding: '10px 14px',
                      fontSize: '12px',
                      color: 'var(--text-3)',
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    +{results.length - 8} результатов...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          marginBottom: 32,
        }}
      >
        <ActionCard
          icon="🔍"
          title="Проверить товар"
          desc="Загрузите фото и получите вердикт ИИ"
          accent="var(--accent)"
          onClick={() => navigate('/verify')}
        />

        <ActionCard
          icon="📋"
          title="История проверок"
          desc="Смотрите все ваши запросы"
          accent="var(--green)"
          onClick={() => navigate('/history')}
        />

        <ActionCard
          icon="📦"
          title="Каталог продуктов"
          desc="Все доступные товары"
          accent="var(--yellow)"
          onClick={() => navigate('/products')}
        />
      </div>

      <section style={{ marginBottom: 32 }}>
        <SectionHeader title="Бренды" link="/products" />

        {loadingHome ? (
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} width={110} height={40} radius={8} />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {brands.map((b) => {
              const id = b.brandId || b.id;

              return (
                <Link
                  key={id}
                  to={`/products?brandId=${id}`}
                  style={{
                    padding: '7px 14px',
                    borderRadius: 20,
                    background: 'var(--bg-3)',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    color: 'var(--text-2)',
                    fontWeight: 500,
                    transition: 'all var(--transition)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-active)';
                    e.currentTarget.style.color = 'var(--text)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-2)';
                  }}
                >
                  {b.name || b.brandName}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section>
        <SectionHeader title="Продукты" link="/products" />

        {loadingHome ? (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} height={120} radius={8} />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: 12,
            }}
          >
            {products.map((p) => {
              const id = p.productId || p.id;
              return <ProductCard key={id} product={p} onClick={() => openProduct(p)} />;
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function ActionCard({ icon, title, desc, accent, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hov ? 'var(--border-active)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '18px',
        textAlign: 'left',
        cursor: 'pointer',
        fontFamily: 'var(--font)',
        transition: 'all var(--transition)',
        transform: hov ? 'translateY(-1px)' : 'none',
        boxShadow: hov ? '0 8px 20px rgba(0,0,0,0.3)' : 'none',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg, ${accent}, transparent)`,
          opacity: hov ? 1 : 0.4,
          transition: 'opacity var(--transition)',
        }}
      />

      <div style={{ fontSize: '22px', marginBottom: 10 }}>{icon}</div>

      <div
        style={{
          fontWeight: 600,
          fontSize: '14px',
          color: 'var(--text)',
          marginBottom: 4,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </div>

      <div
        style={{
          fontSize: '12.5px',
          color: 'var(--text-3)',
          lineHeight: 1.5,
        }}
      >
        {desc}
      </div>
    </button>
  );
}

function SectionHeader({ title, link }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}
    >
      <h2 style={{ fontSize: '16px', fontWeight: 600, letterSpacing: '-0.02em' }}>
        {title}
      </h2>

      {link && (
        <Link
          to={link}
          style={{
            fontSize: '12.5px',
            color: 'var(--accent)',
            fontWeight: 500,
            transition: 'opacity var(--transition)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.7';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
          }}
        >
          Смотреть все →
        </Link>
      )}
    </div>
  );
}

function ProductCard({ product, onClick }) {
  const [hov, setHov] = useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hov ? 'var(--border-active)' : 'var(--border)'}`,
        borderRadius: 'var(--radius-lg)',
        padding: '14px',
        cursor: 'pointer',
        transition: 'all var(--transition)',
        transform: hov ? 'translateY(-1px)' : 'none',
      }}
    >
      <div
        style={{
          width: '100%',
          height: 80,
          borderRadius: 6,
          background: 'var(--bg-4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 28,
          marginBottom: 10,
          overflow: 'hidden',
        }}
      >
        {product.mainImageUrl ? (
          <img
            src={product.mainImageUrl}
            alt={product.name || product.productName}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: 6,
            }}
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
          fontSize: '13px',
          color: 'var(--text)',
          marginBottom: 3,
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
    </div>
  );
}