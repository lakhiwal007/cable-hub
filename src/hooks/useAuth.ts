import { useEffect, useState } from 'react';
import apiClient from '@/lib/apiClient';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => apiClient.isAuthenticated());

  useEffect(() => {
    setIsAuthenticated(apiClient.isAuthenticated());
    // Listen to Supabase auth state changes if available
    const { data: listener } = (apiClient.supabase?.auth || apiClient.supabase?.auth?.onAuthStateChange)
      ? apiClient.supabase.auth.onAuthStateChange(() => {
          setIsAuthenticated(apiClient.isAuthenticated());
        })
      : { data: { subscription: null } };
    return () => {
      if (listener && listener.subscription) {
        listener.subscription.unsubscribe();
      }
    };
  }, []);

  return { isAuthenticated };
} 