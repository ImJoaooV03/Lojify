import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, type Store, type Profile } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: any | null;
  store: Store | null;
  profile: Profile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshStore: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  store: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshStore: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStoreAndProfile = async (userId: string) => {
    try {
      // OTIMIZAÇÃO: Promise.all para buscar dados em paralelo
      const [profileResponse, storeResponse] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('stores').select('*').eq('owner_id', userId).single()
      ]);
      
      if (profileResponse.data) setProfile(profileResponse.data);
      if (storeResponse.data) setStore(storeResponse.data);
      
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (mounted) {
          setSession(session);
          if (session?.user) {
            await fetchStoreAndProfile(session.user.id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error("Auth init error:", error);
        if (mounted) setLoading(false);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) {
        setSession(session);
        
        if (session?.user) {
          // CRÍTICO: Usar setTimeout para evitar Deadlock no callback síncrono do Supabase
          // Não usar await aqui dentro!
          setTimeout(() => {
             fetchStoreAndProfile(session.user.id);
          }, 0);
        } else {
          setStore(null);
          setProfile(null);
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setStore(null);
    setProfile(null);
    setSession(null);
    setLoading(false);
  };

  const refreshStore = async () => {
    if (session?.user) {
      await fetchStoreAndProfile(session.user.id);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user ?? null, 
      store, 
      profile, 
      loading, 
      signOut,
      refreshStore
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
