import { useState, useCallback } from 'react';

export function useApi(fn, opts = {}) {
  const [data, setData] = useState(opts.initialData ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      setData(res.data);
      opts.onSuccess?.(res.data);
      return res.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.message || 'Ошибка';
      setError(msg);
      opts.onError?.(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]); // eslint-disable-line

  return { data, loading, error, execute, setData };
}
