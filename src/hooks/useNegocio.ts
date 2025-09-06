// hooks/useNegocio.ts
import { useState, useEffect } from 'react';
import { Negocio } from '@/types/orden';
import { useAuth } from '@/components/auth/AuthProvider';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useNegocio = () => {
  const { user } = useAuth();
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const obtenerNegocio = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const negocioRef = doc(db, 'negocios', user.uid);
        const negocioDoc = await getDoc(negocioRef);
        
        if (negocioDoc.exists()) {
          setNegocio({ id: negocioDoc.id, ...negocioDoc.data() } as Negocio);
        } else {
          setError('No se encontró información del negocio');
        }
      } catch (error) {
        console.error('Error obteniendo negocio:', error);
        setError('Error al cargar la información del negocio');
      } finally {
        setLoading(false);
      }
    };

    obtenerNegocio();
  }, [user]);

  return { negocio, loading, error };
};