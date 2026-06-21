import { useEffect, useState, useCallback, useRef } from 'react';
import { imagesAPI, productsAPI } from '../../../api/services';
import {
  Btn,
  PageHeader,
  Card,
  Badge,
  Modal,
  Select,
  toast,
  useConfirm,
  Spinner
} from '../../../components/ui';
import { useLocation } from 'react-router-dom';

const ANGLES = [
  'FRONT',
  'BACK',
  'SIDE_LEFT',
  'SIDE_RIGHT',
  'TOP_WITH_CAP',
  'TOP_WITHOUT_CAP',
  'BOX_FRONT',
  'BOX_BACK',
  'BOX_SIDE_LEFT',
  'BOX_SIDE_RIGHT',
  'BOX_TOP',
  'LOGO',
  'TEXT',
  'BOX_TEXT',
  'CAP',
  'BARCODE',
  'INGREDIENTS',
  'UNKNOWN',
];

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function productLabel(p) {
  return `[${p.productId}] ${p.name || 'Без названия'}${
    p.brandName ? ` — ${p.brandName}` : ''
  }${p.barcode ? ` — ${p.barcode}` : ''}`;
}

export default function ImagesPage() {
  const query = useQuery();

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(
    query.get('productId') || ''
  );

  const [activeType, setActiveType] = useState('DATASET');

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [uploadModal, setUploadModal] = useState(false);
  const [angle, setAngle] = useState('UNKNOWN');

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const [imageViewer, setImageViewer] = useState(null);

  const [editImage, setEditImage] = useState(null);
  const [editAngle, setEditAngle] = useState('UNKNOWN');
  const [editProductId, setEditProductId] = useState('');

  const fileRef = useRef();
  const { confirm, Dialog } = useConfirm();

  useEffect(() => {
    productsAPI
      .getAll()
      .then((res) => setProducts(res.data || []))
      .catch(() => toast.error('Ошибка загрузки продуктов'));
  }, []);

  const loadImages = useCallback(async () => {
    if (!selectedProduct) {
      setImages([]);
      return;
    }

    setLoading(true);

    try {
      let res;

      if (activeType === 'DATASET') {
        res = await imagesAPI.getDataset(selectedProduct);
      } else {
        res = await imagesAPI.getUserUpload(selectedProduct);
      }

      setImages(res.data || []);
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка загрузки изображений'
      );
    } finally {
      setLoading(false);
    }
  }, [selectedProduct, activeType]);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const openUpload = () => {
    setUploadModal(true);
    setSelectedFiles([]);
    setPreviewUrls([]);
    setAngle('UNKNOWN');
  };

  const closeUpload = () => {
    setUploadModal(false);
    setSelectedFiles([]);
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setPreviewUrls([]);
    setAngle('UNKNOWN');
  };

  const openEdit = (img) => {
    setEditImage(img);
    setEditAngle(img.angle || 'UNKNOWN');
    setEditProductId(img.productId || selectedProduct || '');
  };

  const handleUpdate = async () => {
    if (!editImage) return;

    try {
      await imagesAPI.update(editImage.imageId, {
        productId: editProductId,
        angle: editAngle,
      });

      toast.success('Изображение обновлено');
      setEditImage(null);
      loadImages();
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка обновления изображения'
      );
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);

    setSelectedFiles(files);

    previewUrls.forEach((url) => URL.revokeObjectURL(url));

    setPreviewUrls(
      files.map((file) => URL.createObjectURL(file))
    );
  };

  const handleUpload = async () => {
    if (!selectedProduct) {
      toast.error('Выберите продукт');
      return;
    }

    if (selectedFiles.length === 0) {
      toast.error('Выберите хотя бы одно фото');
      return;
    }

    setUploading(true);

    try {
      await imagesAPI.uploadDataset(
        selectedProduct,
        selectedFiles,
        angle
      );

      toast.success('Dataset изображения загружены');
      closeUpload();
      loadImages();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (img) => {
    const ok = await confirm('Удалить это изображение?');

    if (!ok) return;

    try {
      await imagesAPI.delete(img.imageId);
      toast.success('Изображение удалено');
      loadImages();
    } catch (e) {
      toast.error(
        e.response?.data?.message || 'Ошибка при удалении'
      );
    }
  };

  const angleLabel = (value) => {
   const labels = {
    FRONT: 'Спереди',
    BACK: 'Сзади',

    SIDE_LEFT: 'Слева',
    SIDE_RIGHT: 'Справа',

    TOP_WITH_CAP: 'Сверху с крышкой',
    TOP_WITHOUT_CAP: 'Сверху без крышки',

    BOX_FRONT: 'Упаковка спереди',
    BOX_BACK: 'Упаковка сзади',
    BOX_SIDE_LEFT: 'Упаковка слева',
    BOX_SIDE_RIGHT: 'Упаковка справа',
    BOX_TOP: 'Верх упаковки',

    LOGO: 'Логотип',
    TEXT: 'Текст на товаре',
    BOX_TEXT: 'Текст на упаковке',
    CAP: 'Крышка / дозатор',
    BARCODE: 'Штрих-код',
    INGREDIENTS: 'Состав',

    UNKNOWN: 'Не указано',
  };

    return labels[value] || value;
  };

  const typeColor = (type) => {
    if (type === 'DATASET') return 'blue';
    if (type === 'USER_UPLOAD') return 'orange';
    if (type === 'MAIN') return 'purple';
    return 'default';
  };

  return (
    <div>
      <PageHeader
        title="Изображения"
        subtitle={
          activeType === 'DATASET'
            ? 'Dataset изображения продуктов'
            : 'Изображения, загруженные пользователями'
        }
      />

      <Card style={{ marginBottom: 20, padding: 16 }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr auto',
            gap: 12,
            alignItems: 'end',
          }}
        >
          <Select
            label="Продукт"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="">— Выберите продукт —</option>

            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {productLabel(p)}
              </option>
            ))}
          </Select>

          {activeType === 'DATASET' && (
            <Btn onClick={openUpload} disabled={!selectedProduct}>
              + Загрузить dataset
            </Btn>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            gap: 8,
            marginTop: 16,
          }}
        >
          <Btn
            variant={activeType === 'DATASET' ? 'primary' : 'secondary'}
            onClick={() => setActiveType('DATASET')}
          >
            Dataset изображения
          </Btn>

          <Btn
            variant={activeType === 'USER_UPLOAD' ? 'primary' : 'secondary'}
            onClick={() => setActiveType('USER_UPLOAD')}
          >
            User uploads
          </Btn>
        </div>
      </Card>

      {!selectedProduct ? (
        <Card>
          <EmptyState
            icon="🖼"
            text="Выберите продукт для просмотра изображений"
          />
        </Card>
      ) : loading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '60px 0',
          }}
        >
          <Spinner size={28} />
        </div>
      ) : images.length === 0 ? (
        <Card>
          <EmptyState
            icon={activeType === 'DATASET' ? '📷' : '👤'}
            text={
              activeType === 'DATASET'
                ? 'Нет dataset изображений для этого продукта'
                : 'Нет user upload изображений для этого продукта'
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
            gap: 14,
          }}
        >
          {images.map((img) => (
            <Card
              key={img.imageId}
              style={{
                padding: 0,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  aspectRatio: '1',
                  cursor: 'pointer',
                  background: 'var(--bg-3)',
                  overflow: 'hidden',
                }}
                onClick={() => setImageViewer(img.imageUrl)}
              >
                <img
                  src={img.imageUrl}
                  alt={img.angle || 'image'}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = 'scale(1.05)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = 'scale(1)')
                  }
                  onError={(e) => {
                    e.currentTarget.parentElement.style.background =
                      'var(--bg-4)';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>

              <div style={{ padding: '10px 12px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 6,
                    marginBottom: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <Badge color={typeColor(img.type || activeType)}>
                    {img.type || activeType}
                  </Badge>

                  <Badge color="default">
                    {angleLabel(img.angle)}
                  </Badge>
                </div>

                {activeType === 'DATASET' && (
                  <Btn
                    size="sm"
                    variant="secondary"
                    onClick={() => openEdit(img)}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      marginBottom: 6,
                    }}
                  >
                    Изменить
                  </Btn>
                )}

                <Btn
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(img)}
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                  }}
                >
                  Удалить
                </Btn>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!uploadModal}
        onClose={closeUpload}
        title="Загрузить dataset изображения"
        width={520}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: '2px dashed var(--border-active)',
              borderRadius: 'var(--radius-lg)',
              padding: '24px',
              textAlign: 'center',
              cursor: 'pointer',
              background: 'var(--bg-3)',
              overflow: 'hidden',
            }}
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {previewUrls.length > 0 ? (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(90px, 1fr))',
                  gap: 8,
                }}
              >
                {previewUrls.map((url, index) => (
                  <img
                    key={url}
                    src={url}
                    alt={`preview-${index}`}
                    style={{
                      width: '100%',
                      height: 90,
                      borderRadius: 8,
                      objectFit: 'cover',
                    }}
                  />
                ))}
              </div>
            ) : (
              <div>
                <div style={{ fontSize: 28, marginBottom: 8 }}>
                  📤
                </div>

                <p
                  style={{
                    color: 'var(--text-2)',
                    fontSize: 13,
                  }}
                >
                  Нажмите для выбора одного или нескольких файлов
                </p>

                <p
                  style={{
                    color: 'var(--text-3)',
                    fontSize: 11,
                    marginTop: 4,
                  }}
                >
                  PNG, JPG, WEBP
                </p>
              </div>
            )}
          </div>

          {selectedFiles.length > 0 && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--text-2)',
              }}
            >
              Выбрано файлов: {selectedFiles.length}
            </div>
          )}

          <Select
            label="Угол съёмки"
            value={angle}
            onChange={(e) => setAngle(e.target.value)}
          >
            {ANGLES.map((a) => (
              <option key={a} value={a}>
                {angleLabel(a)}
              </option>
            ))}
          </Select>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
            }}
          >
            <Btn variant="secondary" onClick={closeUpload}>
              Отмена
            </Btn>

            <Btn
              loading={uploading}
              disabled={selectedFiles.length === 0}
              onClick={handleUpload}
            >
              Загрузить
            </Btn>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!imageViewer}
        onClose={() => setImageViewer(null)}
        title="Просмотр"
        width={700}
      >
        {imageViewer && (
          <img
            src={imageViewer}
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

      <Modal
        open={!!editImage}
        onClose={() => setEditImage(null)}
        title="Редактировать dataset изображение"
        width={460}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          <Select
            label="Продукт"
            value={editProductId}
            onChange={(e) => setEditProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.productId} value={p.productId}>
                {productLabel(p)}
              </option>
            ))}
          </Select>

          <Select
            label="Угол съёмки"
            value={editAngle}
            onChange={(e) => setEditAngle(e.target.value)}
          >
            {ANGLES.map((a) => (
              <option key={a} value={a}>
                {angleLabel(a)}
              </option>
            ))}
          </Select>

          <div
            style={{
              display: 'flex',
              gap: 8,
              justifyContent: 'flex-end',
            }}
          >
            <Btn
              variant="secondary"
              onClick={() => setEditImage(null)}
            >
              Отмена
            </Btn>

            <Btn onClick={handleUpdate}>
              Сохранить
            </Btn>
          </div>
        </div>
      </Modal>

      <Dialog />
    </div>
  );
}

function EmptyState({ icon, text }) {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 0',
        color: 'var(--text-3)',
      }}
    >
      <div
        style={{
          fontSize: 36,
          marginBottom: 12,
        }}
      >
        {icon}
      </div>

      <p>{text}</p>
    </div>
  );
}