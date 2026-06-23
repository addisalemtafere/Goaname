import { useCallback, useState } from 'react';

export function useAdminPageState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const clearFeedback = useCallback(() => {
    setError(null);
    setMessage(null);
  }, []);

  const run = useCallback(async <T,>(action: () => Promise<T>, successMessage?: string): Promise<T | null> => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const result = await action();
      if (successMessage) {
        setMessage(successMessage);
      }

      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, message, clearFeedback, run, setMessage, setError };
}
