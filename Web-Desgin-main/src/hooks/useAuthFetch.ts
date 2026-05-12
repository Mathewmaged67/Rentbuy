import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import { apiFetch } from '@/lib/api';
import { useApp } from '@/store/app-store';

export function useAuthFetch() {
  const navigate = useNavigate();
  const { dispatch } = useApp();

  const authFetch = useCallback(async (path: string, options?: RequestInit) => {
    try {
      const response = await apiFetch(path, options);
      
      if (response.status === 401 || response.status === 403) {
        // Token expired or unauthorized
        dispatch({ type: 'LOGOUT' });
        navigate({ to: '/auth', search: { mode: 'login' } as never });
        throw new Error('Session expired. Please log in again.');
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  }, [navigate, dispatch]);

  return authFetch;
}
