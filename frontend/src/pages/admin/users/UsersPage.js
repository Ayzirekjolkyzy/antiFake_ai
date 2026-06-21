import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usersAPI, verificationsAPI } from '../../../api/services';
import {
  Btn,
  Table,
  Modal,
  PageHeader,
  Card,
  Badge,
  useConfirm,
  toast,
  Spinner
} from '../../../components/ui';

function statusBadge(blocked) {
  return !blocked
    ? <Badge color="green">Активен</Badge>
    : <Badge color="red">Заблокирован</Badge>;
}

function getUserName(user) {
  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(' ');

  return (
    user.username ||
    user.name ||
    fullName ||
    user.email ||
    'Без имени'
  );
}

function getVerificationId(v) {
  return v.requestId || v.verificationId || v.id;
}

function verdictColor(v) {
  if (v === 'ORIGINAL') return 'green';
  if (v === 'FAKE') return 'red';
  if (v === 'UNKNOWN') return 'yellow';
  return 'default';
}

export default function UsersPage() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selected, setSelected] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const { confirm, Dialog } = useConfirm();

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const res = await usersAPI.getAll();
      setUsers(res.data || []);
    } catch {
      toast.error('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openUser = async (user) => {
    setSelected(user);
    setHistory([]);
    setHistoryLoading(true);

    try {
      const res = await verificationsAPI.getUserHistory(user.userId);
      setHistory(res.data || []);
    } catch {
      toast.error('Ошибка загрузки истории проверок');
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openVerification = (verification) => {
    const id = getVerificationId(verification);

    if (!id) {
      toast.error('ID заявки не найден');
      return;
    }

    setSelected(null);

    navigate('/admin/verifications', {
      state: {
        openRequestId: id,
        openTab: 'all',
      },
    });
  };

  const handleToggle = async (user) => {
    const willBlock = !user.blocked;

    const ok = await confirm(
      `Вы хотите ${willBlock ? 'заблокировать' : 'разблокировать'} пользователя ${user.email}?`
    );

    if (!ok) return;

    try {
      if (willBlock) {
        await usersAPI.deactivate(user.userId);
      } else {
        await usersAPI.reactivate(user.userId);
      }

      toast.success(
        willBlock
          ? 'Пользователь заблокирован'
          : 'Пользователь разблокирован'
      );

      setUsers((prev) =>
        prev.map((u) =>
          u.userId === user.userId
            ? { ...u, blocked: willBlock }
            : u
        )
      );

      if (selected?.userId === user.userId) {
        setSelected((prev) => ({
          ...prev,
          blocked: willBlock,
        }));
      }
    } catch {
      toast.error('Ошибка');
    }
  };

  const handleDelete = async (user) => {
    const ok = await confirm(
      `Удалить аккаунт ${user.email}? Это действие нельзя отменить.`
    );

    if (!ok) return;

    try {
      await usersAPI.delete(user.userId);

      toast.success('Пользователь удалён');

      setUsers((prev) =>
        prev.filter((u) => u.userId !== user.userId)
      );

      setSelected(null);
    } catch {
      toast.error('Ошибка при удалении');
    }
  };

  return (
    <div>
      <PageHeader
        title="Пользователи"
        subtitle={`${users.length} пользователей`}
      />

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          loading={loading}
          emptyText="Нет пользователей"
          data={users}
          columns={[
            {
              key: 'userId',
              title: 'ID',
              width: 60,
            },
            {
              key: 'username',
              title: 'Пользователь',
              render: (_, row) => (
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {getUserName(row)}
                  </div>

                  <div
                    style={{
                      fontSize: 11,
                      color: 'var(--text-3)',
                      fontFamily: 'var(--mono)',
                      marginTop: 2,
                    }}
                  >
                    {row.email || '—'}
                  </div>
                </div>
              ),
            },
            {
              key: 'role',
              title: 'Роль',
              render: (v) => (
                <Badge color={v === 'ADMIN' ? 'purple' : 'blue'}>
                  {v || 'USER'}
                </Badge>
              ),
            },
            {
              key: 'blocked',
              title: 'Статус',
              render: (v) => statusBadge(v),
            },
            {
              key: 'createdAt',
              title: 'Дата регистрации',
              render: (v) =>
                v ? new Date(v).toLocaleDateString('ru') : '—',
            },
            {
              key: '_',
              title: '',
              width: 90,
              render: (_, row) => (
                <Btn
                  size="sm"
                  variant="secondary"
                  onClick={() => openUser(row)}
                >
                  Открыть
                </Btn>
              ),
            },
          ]}
        />
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? `Пользователь: ${getUserName(selected)}`
            : 'Пользователь'
        }
        width={700}
      >
        {selected && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 14,
            }}
          >
            <div
              style={{
                background: 'var(--bg-3)',
                borderRadius: 8,
                padding: 14,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 14,
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'var(--accent)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    color: '#fff',
                  }}
                >
                  {(getUserName(selected)?.[0] || '?').toUpperCase()}
                </div>

                <div>
                  <div style={{ fontWeight: 700 }}>
                    {getUserName(selected)}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-2)',
                      fontFamily: 'var(--mono)',
                    }}
                  >
                    {selected.email || '—'}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    <Badge color={selected.role === 'ADMIN' ? 'purple' : 'blue'}>
                      {selected.role || 'USER'}
                    </Badge>

                    {statusBadge(selected.blocked)}
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-3)',
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                История проверок
              </div>

              {historyLoading ? (
                <Spinner />
              ) : history.length === 0 ? (
                <p
                  style={{
                    color: 'var(--text-3)',
                    fontSize: 13,
                  }}
                >
                  Нет заявок
                </p>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    maxHeight: 300,
                    overflowY: 'auto',
                  }}
                >
                  {history.map((v, index) => {
                    const id = getVerificationId(v);

                    return (
                      <div
                        key={id || index}
                        onClick={() => openVerification(v)}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10,
                          padding: 10,
                          background: 'var(--bg-3)',
                          borderRadius: 8,
                          cursor: 'pointer',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <div>
                          <strong>
                            {v.productName ||
                              v.product?.name ||
                              `Проверка #${id || index + 1}`}
                          </strong>

                          <div
                            style={{
                              marginTop: 4,
                              fontSize: 11,
                              color: 'var(--text-3)',
                            }}
                          >
                            {v.submittedAt
                              ? new Date(v.submittedAt).toLocaleString('ru')
                              : v.createdAt
                                ? new Date(v.createdAt).toLocaleString('ru')
                                : 'Дата не указана'}
                          </div>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                          }}
                        >
                          {v.verdict && (
                            <Badge color={verdictColor(v.verdict)}>
                              {v.verdict}
                            </Badge>
                          )}

                          <span
                            style={{
                              color: 'var(--text-3)',
                              fontSize: 18,
                            }}
                          >
                            →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                gap: 8,
                borderTop: '1px solid var(--border)',
                paddingTop: 10,
              }}
            >
              <Btn
                variant={selected.blocked ? 'success' : 'danger'}
                onClick={() => handleToggle(selected)}
              >
                {selected.blocked
                  ? '🔓 Разблокировать'
                  : '🔒 Заблокировать'}
              </Btn>

              <Btn
                variant="danger"
                onClick={() => handleDelete(selected)}
              >
                Удалить аккаунт
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      <Dialog />
    </div>
  );
}