// hooks/useMultiUser.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getClientesPorUsuario, 
  getOrdenesPorUsuario, 
  getNegocioPorUsuario,
  crearNegocio 
} from '@/lib/multiuser-helpers';
import { Cliente, Orden, Negocio } from '@/types/orden';

import { 
  obtenerProximoNumeroOrden, 
  formatearIdOrden, 
  validarIdOrdenUnico 
} from '@/lib/firebase-utils';
import { db } from '@/lib/firebase';
import { addDoc, collection } from 'firebase/firestore';

export const useClientesUsuario = () => {
  const { user } = useAuth();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarClientes = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const clientesData = await getClientesPorUsuario(user.uid);
        setClientes(clientesData);
        setError(null);
      } catch (err) {
        console.error('Error cargando clientes:', err);
        setError('Error al cargar los clientes');
      } finally {
        setLoading(false);
      }
    };

    cargarClientes();
  }, [user?.uid]);

  const refrescarClientes = async () => {
    if (!user?.uid) return;
    
    try {
      const clientesData = await getClientesPorUsuario(user.uid);
      setClientes(clientesData);
    } catch (err) {
      console.error('Error refrescando clientes:', err);
      setError('Error al actualizar los clientes');
    }
  };

  return { clientes, loading, error, refrescarClientes };
};

export const useOrdenesUsuario = () => {
  const { user } = useAuth();
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarOrdenes = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const ordenesData = await getOrdenesPorUsuario(user.uid);
        setOrdenes(ordenesData);
        setError(null);
      } catch (err) {
        console.error('Error cargando órdenes:', err);
        setError('Error al cargar las órdenes');
      } finally {
        setLoading(false);
      }
    };

    cargarOrdenes();
  }, [user?.uid]);

  const refrescarOrdenes = async () => {
    if (!user?.uid) return;
    
    try {
      const ordenesData = await getOrdenesPorUsuario(user.uid);
      setOrdenes(ordenesData);
    } catch (err) {
      console.error('Error refrescando órdenes:', err);
      setError('Error al actualizar las órdenes');
    }
  };

    const crearOrdenConsecutiva = async (ordenData: any, userId: string) => {
    try {
      // Obtener el próximo número consecutivo
      const proximoNumero = await obtenerProximoNumeroOrden(ordenData.tipo || 'mantenimiento');
      
      // Formatear el ID
      const idPersonalizado = formatearIdOrden(proximoNumero, ordenData.tipo || 'mantenimiento');
      
      // Verificar que el ID sea único (por seguridad)
      const esUnico = await validarIdOrdenUnico(idPersonalizado);
      if (!esUnico) {
        throw new Error('El ID generado ya existe');
      }

      // Crear la orden con el ID consecutivo
      const ordenCompleta = {
        ...ordenData,
        idPersonalizado,
        userId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Guardar en Firestore
      const docRef = await addDoc(collection(db, 'ordenes'), ordenCompleta);
      
      return { id: docRef.id, idPersonalizado };
    } catch (error) {
      console.error('Error creando orden:', error);
      throw error;
    }
  };

  return {
     ordenes, loading, error, refrescarOrdenes, crearOrdenConsecutiva
  };
  
};




export const useNegocioUsuario = () => {
  const { user } = useAuth();
  const [negocio, setNegocio] = useState<Negocio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cargarNegocio = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let negocioData = await getNegocioPorUsuario(user.uid);
        
        // Si no existe el negocio, crear uno por defecto
        if (!negocioData) {
          const negocioDefault = {
            userId: user.uid,
            nombre: user.displayName || 'Mi Negocio',
            direccion: '',
            telefono: '',
            email: user.email || '',
            nit: '',
            logoUrl: ''
          };
          
          await crearNegocio(negocioDefault, user.uid);
          negocioData = await getNegocioPorUsuario(user.uid);
        }
        
        setNegocio(negocioData);
        setError(null);
      } catch (err) {
        console.error('Error cargando negocio:', err);
        setError('Error al cargar los datos del negocio');
      } finally {
        setLoading(false);
      }
    };

    cargarNegocio();
  }, [user?.uid, user?.displayName, user?.email]);

  const refrescarNegocio = async () => {
    if (!user?.uid) return;
    
    try {
      const negocioData = await getNegocioPorUsuario(user.uid);
      setNegocio(negocioData);
    } catch (err) {
      console.error('Error refrescando negocio:', err);
      setError('Error al actualizar los datos del negocio');
    }
  };

  return { negocio, loading, error, refrescarNegocio };
};

// Hook combinado para obtener estadísticas del usuario
export const useEstadisticasUsuario = () => {
  const { user } = useAuth();
  const [estadisticas, setEstadisticas] = useState({
    totalClientes: 0,
    totalOrdenes: 0,
    ordenesPendientes: 0,
    ordenesCompletadas: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [clientes, ordenes] = await Promise.all([
          getClientesPorUsuario(user.uid),
          getOrdenesPorUsuario(user.uid)
        ]);

        // Calcular estadísticas
        const ordenesPendientes = ordenes.filter(orden => 
          orden.tipo !== 'entrega' || !orden.validacionCliente
        ).length;
        
        const ordenesCompletadas = ordenes.filter(orden => 
          orden.tipo === 'entrega' && orden.validacionCliente
        ).length;

        setEstadisticas({
          totalClientes: clientes.length,
          totalOrdenes: ordenes.length,
          ordenesPendientes,
          ordenesCompletadas
        });
      } catch (err) {
        console.error('Error cargando estadísticas:', err);
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [user?.uid]);

  return { estadisticas, loading };
};