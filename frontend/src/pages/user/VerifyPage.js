import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { productsAPI, verificationsAPI } from '../../api/services';
import { Btn, toast, FileZone } from '../../components/ui';

function getProductId(product) {
  return product?.productId || product?.id;
}

function getProductName(product) {
  return product?.productName || product?.name || 'Без названия';
}

const IMAGE_ANGLES = [
  { value: 'FRONT', label: 'Передняя сторона' },
  { value: 'BACK', label: 'Задняя сторона' },
  { value: 'SIDE_LEFT', label: 'Левая сторона' },
  { value: 'SIDE_RIGHT', label: 'Правая сторона' },
  { value: 'TOP_WITH_CAP', label: 'Верх с крышкой' },
  { value: 'TOP_WITHOUT_CAP', label: 'Верх без крышки' },
  { value: 'BOX_FRONT', label: 'Коробка спереди' },
  { value: 'BOX_BACK', label: 'Коробка сзади' },
  { value: 'BOX_SIDE_LEFT', label: 'Коробка слева' },
  { value: 'BOX_SIDE_RIGHT', label: 'Коробка справа' },
  { value: 'BOX_TOP', label: 'Верх коробки' },
  { value: 'LOGO', label: 'Логотип' },
  { value: 'TEXT', label: 'Текст на товаре' },
  { value: 'BOX_TEXT', label: 'Текст на коробке' },
  { value: 'CAP', label: 'Крышка / дозатор' },
  { value: 'BARCODE', label: 'Штрих-код' },
  { value: 'INGREDIENTS', label: 'Состав' },
];

const angleLabel = (angle) =>
  IMAGE_ANGLES.find(a => a.value === angle)?.label || angle;

function VerdictDisplay({ result }) {
  const isOriginal = result.verdict === 'ORIGINAL';
  const isFake = result.verdict === 'FAKE';
  const isPending = !result.verdict || result.verdict === 'UNKNOWN';

  const color = isOriginal ? 'var(--green)' : isFake ? 'var(--red)' : 'var(--yellow)';
  const bg = isOriginal ? 'var(--green-bg)' : isFake ? 'var(--red-bg)' : 'var(--yellow-bg)';
  const border = isOriginal ? 'var(--green-border)' : isFake ? 'var(--red-border)' : 'var(--yellow-border)';

  const icon = isOriginal ? '✅' : isFake ? '🚫' : '⏳';
  const label = isOriginal ? 'Оригинал' : isFake ? 'Подделка' : 'На проверке';

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        textAlign: 'center',
        animation: 'fadeIn 0.4s ease',
      }}
    >
      <div style={{ fontSize: '48px', marginBottom: 12 }}>{icon}</div>

      <div style={{ fontSize: '22px', fontWeight: 700, color, letterSpacing: '-0.03em', marginBottom: 8 }}>
        {label}
      </div>

      {result.productName && (
        <div style={{ fontSize: '14px', color: 'var(--text-2)', marginBottom: 20 }}>
          {result.productName}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginTop: 20 }}>
        {result.confidenceScore !== null && result.confidenceScore !== undefined && (
          <ScoreTile label="AI уверенность" value={`${(result.confidenceScore * 100).toFixed(1)}%`} />
        )}

        {result.imageScore !== null && result.imageScore !== undefined && (
          <ScoreTile label="Сходство с выбранным ракурсом" value={`${(result.imageScore * 100).toFixed(1)}%`} />
        )}

        {result.barcodeScore !== null && result.barcodeScore !== undefined && (
          <ScoreTile
            label="Штрих-код"
            value={result.barcodeMatch ? 'Совпадает' : 'Не совпадает'}
            valueColor={result.barcodeMatch ? 'var(--green)' : 'var(--red)'}
          />
        )}

        {result.angleMismatch && (
          <>
            <ScoreTile
              label="Выбранный ракурс"
              value={result.selectedAngle}
            />

            <ScoreTile label="Наиболее похожий ракурс" value={result.detectedAngle} />
          </>
        )}
      </div>

     {result.aiMessage && !result.reason?.includes(result.aiMessage) && (
  <InfoBox title="AI анализ" text={result.aiMessage} />
)}
{result.authenticityRisk && (
  <InfoBox
    title="Риск подделки"
    text={
      result.authenticityRisk === 'HIGH'
        ? 'Высокий риск подделки'
        : result.authenticityRisk === 'MEDIUM'
        ? 'Средний риск подделки'
        : 'Низкий риск подделки'
    }
  />
)}

{result.visualDifferences?.length > 0 && (
  <div
    style={{
      marginTop: 14,
      background: 'var(--bg-3)',
      border: '1px solid var(--border)',
      borderRadius: 8,
      padding: 14,
      textAlign: 'left',
    }}
  >
    <div
      style={{
        fontSize: 11,
        color: 'var(--text-3)',
        fontFamily: 'var(--mono)',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      Найденные отличия
    </div>

    <ul
      style={{
        margin: 0,
        paddingLeft: 18,
        color: 'var(--text-2)',
        lineHeight: 1.7,
        fontSize: 13,
      }}
    >
      {result.visualDifferences.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
)}

{result.suspiciousElements?.length > 0 && (
  <div
    style={{
      marginTop: 14,
      background: 'var(--yellow-bg)',
      border: '1px solid var(--yellow-border)',
      borderRadius: 8,
      padding: 14,
      textAlign: 'left',
    }}
  >
    <div
      style={{
        fontSize: 11,
        color: 'var(--yellow)',
        fontFamily: 'var(--mono)',
        textTransform: 'uppercase',
        marginBottom: 8,
      }}
    >
      Подозрительные элементы
    </div>

    <ul
      style={{
        margin: 0,
        paddingLeft: 18,
        color: 'var(--text)',
        lineHeight: 1.7,
        fontSize: 13,
      }}
    >
      {result.suspiciousElements.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  </div>
)}

{result.aiExplanation && (
  <InfoBox
    title="Подробное объяснение"
    text={result.aiExplanation}
  />
)}

      {result.reason && (
<InfoBox
  title="Результат проверки"
  text={result.message || result.reason}
/>
      )}

      {result.angleMismatch && (

          <div
            style={{
              marginTop: 12,
              background: 'var(--yellow-bg)',
              border: '1px solid var(--yellow-border)',
              borderRadius: 8,
              padding: 12,
              fontSize: 13,
              color: 'var(--yellow)',
              lineHeight: 1.6,
            }}
          >
⚠ Вы выбрали <b>{angleLabel(result.selectedAngle)}</b>,
но изображение больше похоже на
<b>{angleLabel(result.detectedAngle)}</b>.
Оценка фото рассчитана именно по выбранному вами ракурсу,
поэтому результат может быть неточным.
          </div>
        )}

      {result.adminComment && (
        <InfoBox title="Комментарий администратора" text={result.adminComment} accent />
      )}

      {isPending && (
        <p style={{ marginTop: 16, fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.6 }}>
          Запрос сохранён. Окончательное решение может подтвердить администратор.
        </p>
      )}
    </div>
  );
}

function InfoBox({ title, text, accent }) {
  return (
    <div
      style={{
        marginTop: 14,
        background: accent ? 'var(--accent-subtle)' : 'var(--bg-3)',
        border: accent ? '1px solid rgba(43,138,255,0.15)' : '1px solid var(--border)',
        borderRadius: 8,
        padding: '14px',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          color: accent ? 'var(--accent)' : 'var(--text-3)',
          fontFamily: 'var(--mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <p style={{ fontSize: '13.5px', color: 'var(--text-2)', lineHeight: 1.65 }}>
        {text}
      </p>
    </div>
  );
}

function ScoreTile({ label, value, valueColor }) {
  return (
    <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '12px', border: '1px solid var(--border)' }}>
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
        {label}
      </div>

      <div style={{ fontSize: '16px', fontWeight: 700, color: valueColor || 'var(--text)', letterSpacing: '-0.02em' }}>
        {value}
      </div>
    </div>
  );
}

function AiWaitingCard() {
  const steps = [
    'Загружаем изображение',
    'Сравниваем с эталонами',
    'Проверяем выбранный ракурс',
    'Формируем AI-решение',
  ];

  return (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bg-3), var(--bg-2))',
        border: '1px solid var(--border-active)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        textAlign: 'center',
        animation: 'fadeIn 0.3s ease',
      }}
    >
      <style>
        {`
          @keyframes aiScanMove {
            0% { transform: translateX(-120%); }
            50% { transform: translateX(80%); }
            100% { transform: translateX(240%); }
          }
          @keyframes aiPulse {
            0%, 100% { transform: scale(1); opacity: .85; }
            50% { transform: scale(1.08); opacity: 1; }
          }
        `}
      </style>

      <div style={{ fontSize: 38, marginBottom: 10, animation: 'aiPulse 1.4s ease-in-out infinite' }}>
        🧠🔍
      </div>

      <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
        AntiFakeAI анализирует товар
      </div>

      <div style={{ fontSize: 12.5, color: 'var(--text-3)', lineHeight: 1.6, maxWidth: 420, margin: '0 auto' }}>
        Система сравнивает фото с эталонными изображениями, проверяет ракурс,
        штрих-код и визуальные признаки упаковки.
      </div>

      <div
        style={{
          marginTop: 16,
          height: 7,
          background: 'var(--bg-4)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: '45%',
            height: '100%',
            background: 'var(--accent)',
            borderRadius: 999,
            animation: 'aiScanMove 1.5s ease-in-out infinite',
          }}
        />
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {steps.map((s, i) => (
          <div
            key={s}
            style={{
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '9px 10px',
              fontSize: '12px',
              color: 'var(--text-2)',
            }}
          >
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', marginRight: 6 }}>
              {String(i + 1).padStart(2, '0')}
            </span>
            {s}
          </div>
        ))}
      </div>

      <p style={{ marginTop: 14, fontSize: '11.5px', color: 'var(--text-3)' }}>
        Вы сегодня отлично выглядите!.
      </p>
    </div>
  );
}

export default function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const prefillProductId = searchParams.get('productId');

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [form, setForm] = useState({
    productId: prefillProductId || '',
    barcodeInput: '',
    imageAngle: 'FRONT',
    image: null,
  });

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    productsAPI
      .getAll()
      .then((res) => setProducts(res.data || []))
      .catch(() => toast.error('Ошибка загрузки продуктов'))
      .finally(() => setLoadingProducts(false));
  }, []);

  useEffect(() => {
    if (prefillProductId && products.length > 0) {
      const product = products.find((p) => String(getProductId(p)) === String(prefillProductId));

      if (product) {
        setSelectedProduct(product);
        setForm((prev) => ({ ...prev, productId: getProductId(product) }));
      }
    }
  }, [prefillProductId, products]);

  useEffect(() => {
    if (!productSearch.trim()) {
      setProductResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);

      try {
        const res = await productsAPI.search(productSearch.trim());
        setProductResults(res.data || []);
      } catch {
        setProductResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch]);

  const selectProduct = (product) => {
    const id = getProductId(product);

    if (!id) {
      toast.error('У выбранного продукта нет ID');
      return;
    }

    setSelectedProduct(product);
    setForm((prev) => ({ ...prev, productId: id }));
    setProductSearch('');
    setProductResults([]);
    setErrors((prev) => ({ ...prev, productId: '' }));
  };

  const clearProduct = () => {
    setSelectedProduct(null);
    setForm((prev) => ({ ...prev, productId: '' }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.productId) nextErrors.productId = 'Выберите продукт';
    if (!form.imageAngle) nextErrors.imageAngle = 'Выберите ракурс';
    if (!form.image) nextErrors.image = 'Загрузите фото';

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const getVerifyErrorMessage = (data) => {
    const code =
      data?.code ||
      data?.message ||
      data?.validationErrors?.[0]?.code ||
      data?.validationErrors?.[0]?.message ||
      '';

    const messages = {
      PRODUCT_REQUIRED: 'Выберите продукт.',
      PRODUCT_NOT_FOUND: 'Продукт не найден.',
      FILE_REQUIRED: 'Загрузите фото.',
      TYPE_REQUIRED: 'Выберите ракурс изображения.',
      AI_ANALYSIS_FAILED: 'Ошибка AI-анализа. Попробуйте ещё раз.',
    };

    return messages[code] || data?.message || 'Ошибка при отправке';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setSubmitting(true);

    try {
      const res = await verificationsAPI.verify(form);
      setResult(res.data);
      toast.success('Проверка завершена!');
    } catch (err) {
      toast.error(getVerifyErrorMessage(err?.response?.data));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setResult(null);
    setSelectedProduct(null);
    setForm({
      productId: '',
      barcodeInput: '',
      imageAngle: 'FRONT',
      image: null,
    });
    setErrors({});
  };

  if (result) {
    return (
      <div style={{ maxWidth: 600, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
        <div
          style={{
            marginBottom: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: 16,
            borderBottom: '1px solid var(--border)',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em' }}>
            Результат проверки
          </h1>

          <div style={{ display: 'flex', gap: 8 }}>
            <Btn variant="secondary" size="sm" onClick={() => navigate('/history')}>
              История
            </Btn>

            <Btn variant="secondary" size="sm" onClick={resetForm}>
              Новая проверка
            </Btn>
          </div>
        </div>

        <VerdictDisplay result={result} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.03em' }}>
          Проверить товар
        </h1>

        <p style={{ color: 'var(--text-3)', marginTop: 3, fontSize: '13px' }}>
          Выберите товар, укажите ракурс и загрузите одно фото для AI-проверки
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        <Section title="Выбор продукта" required>
          {selectedProduct ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'var(--bg-3)',
                border: errors.productId ? '1px solid var(--red-border)' : '1px solid var(--green-border)',
                borderRadius: 'var(--radius)',
                padding: '12px 14px',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 6, background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                📦
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: '14px' }}>
                  {getProductName(selectedProduct)}
                </div>

                {selectedProduct.brandName && (
                  <div style={{ fontSize: '12px', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: 1 }}>
                    {selectedProduct.brandName}
                  </div>
                )}

                {getProductId(selectedProduct) && (
                  <div style={{ fontSize: '11px', color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: 3 }}>
                    ID: {getProductId(selectedProduct)}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={clearProduct}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}
              >
                ✕
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Поиск продукта..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-3)',
                  border: `1px solid ${errors.productId ? 'var(--red-border)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius)',
                  padding: '9px 13px',
                  color: 'var(--text)',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'var(--font)',
                }}
              />

              {searching && (
                <span style={{ position: 'absolute', right: 11, top: '50%', transform: 'translateY(-50%)' }}>
                  ⏳
                </span>
              )}

              {productResults.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border-active)',
                    borderRadius: 8,
                    boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
                    zIndex: 50,
                    maxHeight: 240,
                    overflowY: 'auto',
                  }}
                >
                  {productResults.map((product) => (
                    <button
                      key={getProductId(product)}
                      type="button"
                      onClick={() => selectProduct(product)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        border: 'none',
                        background: 'transparent',
                        color: 'var(--text)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        textAlign: 'left',
                        borderBottom: '1px solid var(--border)',
                        fontFamily: 'var(--font)',
                      }}
                    >
                      <span style={{ fontSize: '16px' }}>📦</span>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '13.5px' }}>
                          {getProductName(product)}
                        </div>

                        {product.brandName && (
                          <div style={{ fontSize: '11.5px', color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                            {product.brandName}
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!productSearch && !loadingProducts && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-3)', marginBottom: 6, fontFamily: 'var(--mono)' }}>
                    Или выберите из списка:
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, maxHeight: 120, overflowY: 'auto' }}>
                    {products.slice(0, 20).map((product) => (
                      <button
                        key={getProductId(product)}
                        type="button"
                        onClick={() => selectProduct(product)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          border: '1px solid var(--border)',
                          background: 'var(--bg-3)',
                          color: 'var(--text-2)',
                          fontSize: '12.5px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font)',
                        }}
                      >
                        {getProductName(product)}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {errors.productId && (
            <div style={{ fontSize: '11.5px', color: 'var(--red)', marginTop: 4 }}>
              {errors.productId}
            </div>
          )}
        </Section>

        <Section title="Штрих-код (необязательно)">
          <input
            type="text"
            placeholder="Введите штрих-код с упаковки"
            value={form.barcodeInput}
            onChange={(e) => setForm((prev) => ({ ...prev, barcodeInput: e.target.value }))}
            style={{
              width: '100%',
              background: 'var(--bg-3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '9px 13px',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'var(--mono)',
            }}
          />

          <p style={{ fontSize: '11.5px', color: 'var(--text-3)', marginTop: 5 }}>
            Помогает дополнительно проверить соответствие выбранному товару
          </p>
        </Section>

        <Section title="Ракурс изображения" required>
          <select
            value={form.imageAngle}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, imageAngle: e.target.value }));
              setErrors((prev) => ({ ...prev, imageAngle: '' }));
            }}
            style={{
              width: '100%',
              background: 'var(--bg-3)',
              border: `1px solid ${errors.imageAngle ? 'var(--red-border)' : 'var(--border)'}`,
              borderRadius: 'var(--radius)',
              padding: '9px 13px',
              color: 'var(--text)',
              fontSize: '14px',
              outline: 'none',
              fontFamily: 'var(--font)',
            }}
          >
            {IMAGE_ANGLES.map((angle) => (
              <option key={angle.value} value={angle.value}>
                {angle.label}
              </option>
            ))}
          </select>

          {errors.imageAngle && (
            <div style={{ fontSize: '11.5px', color: 'var(--red)', marginTop: 6 }}>
              {errors.imageAngle}
            </div>
          )}
        </Section>

        <Section title="Фото для проверки" required>
          <FileZone
            label="Загрузить фото"
            required
            hint="Фото должно соответствовать выбранному ракурсу"
            file={form.image}
            onChange={(file) => {
              setForm((prev) => ({ ...prev, image: file }));
              setErrors((prev) => ({ ...prev, image: '' }));
            }}
          />

          {errors.image && (
            <div style={{ fontSize: '11.5px', color: 'var(--red)', marginTop: 6 }}>
              {errors.image}
            </div>
          )}
        </Section>

        <div
          style={{
            background: 'var(--accent-subtle)',
            border: '1px solid rgba(43,138,255,0.15)',
            borderRadius: 'var(--radius)',
            padding: '14px 16px',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--accent)', marginBottom: 6 }}>
            💡 Советы для точного результата
          </div>

          <ul style={{ fontSize: '12.5px', color: 'var(--text-3)', lineHeight: 1.8, paddingLeft: 16 }}>
            <li>Выберите правильный ракурс перед загрузкой</li>
            <li>Используйте хорошее освещение</li>
            <li>Фотографируйте так, чтобы товар был полностью виден</li>
            <li>Для логотипа, состава и штрих-кода используйте крупный план</li>
          </ul>
        </div>

        {submitting && <AiWaitingCard />}

        <Btn type="submit" size="lg" fullWidth loading={submitting}>
          {submitting ? 'AI анализирует товар...' : '🔍 Проверить подлинность'}
        </Btn>
      </form>
    </div>
  );
}

function Section({ title, required, children }) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <h3 style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--text-2)' }}>
          {title}
        </h3>

        {required && (
          <span style={{ fontSize: '11px', color: 'var(--red)', fontFamily: 'var(--mono)' }}>
            *
          </span>
        )}
      </div>

      {children}
    </div>
  );
}