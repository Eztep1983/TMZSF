// app/ordenes/mantenimiento/page.tsx
'use client'
import { useState, useEffect, useMemo, useCallback } from 'react'
import { collection, getDocs, query, where, orderBy, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenMantenimiento } from '@/types/orden'
import { Plus, Search, Eye, Printer, ArrowLeft, Wrench, X, Filter, ChevronDown, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import FormularioMantenimiento from '@/app/(app)/ordenes/mantenimiento/fomulario'

// Componente para el modal de visualización
const ModalOrden = ({ orden, onClose, onPrint }: { orden: OrdenMantenimiento, onClose: () => void, onPrint: (orden: OrdenMantenimiento) => void }) => {
  if (!orden) return null;
  
  const getTipoColor = (tipo: string) => {
    return tipo === 'preventivo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sticky top-0 bg-white py-2">
          <h3 className="text-xl font-semibold">Orden de Mantenimiento #{orden.id}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
            aria-label="Cerrar modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Información del Cliente</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Nombre:</span> {orden.cliente?.name || 'N/A'}</p>
                <p><span className="font-medium">Cédula:</span> {orden.cliente?.cedula || 'N/A'}</p>
                <p><span className="font-medium">Teléfono:</span> {orden.cliente?.phone || 'N/A'}</p>
                <p><span className="font-medium">Email:</span> {orden.cliente?.email || 'N/A'}</p>
                <p><span className="font-medium">Dirección:</span> {orden.cliente?.address || 'N/A'}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Información del Dispositivo</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Tipo:</span> {orden.dispositivo?.tipo || 'N/A'}</p>
                <p><span className="font-medium">Marca/Modelo:</span> {orden.dispositivo?.marca || ''} {orden.dispositivo?.modelo || ''}</p>
                <p><span className="font-medium">Número de Serie:</span> {orden.dispositivo?.numeroSerie || 'N/A'}</p>
                <p className="flex items-center">
                  <span className="font-medium mr-2">Tipo de Mantenimiento:</span>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(orden.tipoMantenimiento)}`}>
                    {orden.tipoMantenimiento}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Tareas Realizadas</h4>
              {orden.tareasRealizadas?.length > 0 ? (
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  {orden.tareasRealizadas.map((tarea, index) => (
                    <li key={index}>{tarea}</li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-gray-500">No se registraron tareas</p>
              )}
            </div>
            
            {orden.piezasUsadas && orden.piezasUsadas.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Piezas Utilizadas</h4>
                <ul className="space-y-1 text-sm">
                  {orden.piezasUsadas.map((pieza, index) => (
                    <li key={index}>
                      <span className="font-medium">{pieza.cantidad}x</span> {pieza.pieza}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Estado Antes del Mantenimiento</h4>
            {orden.estadoAntes?.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {orden.estadoAntes.map((estado, index) => (
                  <li key={index}>{estado}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No se registró estado inicial</p>
            )}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Estado Después del Mantenimiento</h4>
            {orden.estadoDespues?.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-sm">
                {orden.estadoDespues.map((estado, index) => (
                  <li key={index}>{estado}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">No se registró estado final</p>
            )}
          </div>
        </div>
        
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-semibold text-gray-900 border-b pb-2 mb-2">Garantía</h4>
          <div className="text-sm">
            <p><span className="font-medium">Duración:</span> {orden.garantiaTiempo || 0} meses</p>
            <p><span className="font-medium">Descripción:</span> {orden.garantiaDescripcion || 'No se especificó garantía'}</p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={() => onPrint(orden)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded-lg"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

// Componente principal
export default function OrdenesMantenimientoPage() {
  const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenMantenimiento | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [paginaActual, setPaginaActual] = useState(1);
  const elementosPorPagina = 10;

  // Cargar órdenes con useCallback para evitar recreación en cada render
  const cargarOrdenes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const q = query(
        collection(db, 'ordenes'),
        where('tipo', '==', 'mantenimiento'),
        orderBy('fechaCreacion', 'desc')
      );
      const querySnapshot = await getDocs(q);
      const ordenesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate()
      })) as OrdenMantenimiento[];
      setOrdenes(ordenesData);
    } catch (err) {
      console.error('Error cargando órdenes:', err);
      setError('No se pudieron cargar las órdenes. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarOrdenes();
  }, [cargarOrdenes]);

  // Manejar clic en una fila de la tabla
  const handleRowClick = useCallback((orden: OrdenMantenimiento) => {
    setOrdenSeleccionada(orden);
  }, []);

  // Filtrado y búsqueda con useMemo para optimización
  const ordenesFiltradas = useMemo(() => {
    return ordenes.filter(orden => {
      // Filtro de búsqueda
      const coincideBusqueda = 
        (orden.cliente?.phone?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (orden.cliente?.cedula?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (orden.cliente?.name?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (orden.dispositivo?.modelo?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
        (orden.dispositivo?.numeroSerie?.toLowerCase() || '').includes(busqueda.toLowerCase());
      
      // Filtro por tipo
      const coincideTipo = filtroTipo === 'todos' || orden.tipoMantenimiento === filtroTipo;
      
      return coincideBusqueda && coincideTipo;
    });
  }, [ordenes, busqueda, filtroTipo]);

  // Paginación
  const totalPaginas = Math.ceil(ordenesFiltradas.length / elementosPorPagina);
  const indiceInicio = (paginaActual - 1) * elementosPorPagina;
  const ordenesPaginadas = ordenesFiltradas.slice(indiceInicio, indiceInicio + elementosPorPagina);

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina);
      // Scroll suave hacia arriba
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getTipoColor = (tipo: string) => {
    return tipo === 'preventivo' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-orange-100 text-orange-800';
  };

  const imprimirOrden = (orden: OrdenMantenimiento) => {
    const contenido = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Orden de Mantenimiento #${orden.id}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { text-align: center; margin-bottom: 30px; }
          .section { margin-bottom: 20px; }
          .section h2 { border-bottom: 2px solid #333; padding-bottom: 5px; }
          .flex-container { display: flex; justify-content: space-between; }
          .cliente, .dispositivo { width: 48%; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; }
          .badge { padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; }
          .preventivo { background-color: #d1fae5; color: #065f46; }
          .correctivo { background-color: #ffedd5; color: #9a3412; }
          @media print {
            body { margin: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Orden de Mantenimiento #${orden.id}</h1>
          <p>Fecha: ${orden.fechaCreacion?.toLocaleDateString()}</p>
        </div>

        <div class="flex-container">
          <div class="cliente section">
            <h2>Información del Cliente</h2>
            <p><strong>Nombre:</strong> ${orden.cliente?.name || 'N/A'}</p>
            <p><strong>Teléfono:</strong> ${orden.cliente?.phone || 'N/A'}</p>
            <p><strong>Cedula:</strong> ${orden.cliente?.cedula || 'N/A'}</p>
            <p><strong>Email:</strong> ${orden.cliente?.email || 'N/A'}</p>
            <p><strong>Dirección:</strong> ${orden.cliente?.address || 'N/A'}</p>
          </div>

          <div class="dispositivo section">
            <h2>Información del Dispositivo</h2>
            <p><strong>Tipo:</strong> ${orden.dispositivo?.tipo || 'N/A'}</p>
            <p><strong>Marca/Modelo:</strong> ${orden.dispositivo?.marca || ''} ${orden.dispositivo?.modelo || ''}</p>
            <p><strong>Número de Serie:</strong> ${orden.dispositivo?.numeroSerie || 'N/A'}</p>
            <p><strong>Tipo de Mantenimiento:</strong> 
              <span class="badge ${orden.tipoMantenimiento === 'preventivo' ? 'preventivo' : 'correctivo'}">
                ${orden.tipoMantenimiento}
              </span>
            </p>
          </div>
        </div>

        <div class="section">
          <h2>Tareas Realizadas</h2>
          <ol>
            ${orden.tareasRealizadas?.map(tarea => `<li>${tarea}</li>`).join('') || '<li>No se registraron tareas</li>'}
          </ol>
        </div>

        ${orden.piezasUsadas && orden.piezasUsadas.length > 0 ? `
        <div class="section">
          <h2>Piezas Utilizadas</h2>
          <table>
            <thead>
              <tr>
                <th>Pieza</th>
                <th>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              ${orden.piezasUsadas.map(pieza => `
                <tr>
                  <td>${pieza.pieza}</td>
                  <td>${pieza.cantidad}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="flex-container">
          <div class="section" style="width: 48%;">
            <h2>Estado Antes del Mantenimiento</h2>
            <ul>
              ${orden.estadoAntes?.map(estado => `<li>${estado}</li>`).join('') || '<li>No se registró estado inicial</li>'}
            </ul>
          </div>

          <div class="section" style="width: 48%;">
            <h2>Estado Después del Mantenimiento</h2>
            <ul>
              ${orden.estadoDespues?.map(estado => `<li>${estado}</li>`).join('') || '<li>No se registró estado final</li>'}
            </ul>
          </div>
        </div>

        <div class="section">
          <h2>Garantía</h2>
          <p><strong>Duración:</strong> ${orden.garantiaTiempo || 0} meses</p>
          <p><strong>Descripción:</strong> ${orden.garantiaDescripcion || 'No se especificó garantía'}</p>
        </div>

        <div class="no-print" style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #065f46; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Imprimir
          </button>
          <button onclick="window.close()" style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-left: 10px;">
            Cerrar
          </button>
        </div>
      </body>
      </html>
    `;

    const ventanaImpression = window.open('', '_blank');
    if (ventanaImpression) {
      ventanaImpression.document.write(contenido);
      ventanaImpression.document.close();
    }
  };

  if (mostrarFormulario) {
    return (
      <FormularioMantenimiento
        onClose={() => setMostrarFormulario(false)}
        onSuccess={() => {
          setMostrarFormulario(false);
          cargarOrdenes();
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link 
                href="/ordenes" 
                className="text-green-600 hover:text-green-800 self-start sm:self-auto transition-colors"
                aria-label="Volver a órdenes"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-start sm:items-center gap-3">
                <Wrench className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Órdenes de Mantenimiento</h1>
                  <p className="text-gray-600 text-sm sm:text-base">
                    Mantenimiento preventivo y correctivo de equipos
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 self-start sm:self-auto transition-colors shadow-md hover:shadow-lg"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm sm:text-base">Nueva Orden</span>
            </button>
          </div>
        </div>

        {/* Mostrar error si existe */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
            <p>{error}</p>
            <button 
              onClick={cargarOrdenes}
              className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Controles de búsqueda y filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por cliente, cédula, teléfono, modelo o número de serie..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              />
            </div>
            
            <div className="relative">
              <button
                onClick={() => setMostrarFiltros(!mostrarFiltros)}
                className="w-full md:w-auto bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filtrar</span>
                {mostrarFiltros ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              
              {mostrarFiltros && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10 p-3 border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tipo de mantenimiento</p>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tipoFiltro"
                        value="todos"
                        checked={filtroTipo === 'todos'}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Todos</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tipoFiltro"
                        value="preventivo"
                        checked={filtroTipo === 'preventivo'}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Preventivo</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="tipoFiltro"
                        value="correctivo"
                        checked={filtroTipo === 'correctivo'}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="rounded text-green-600 focus:ring-green-500"
                      />
                      <span className="text-sm">Correctivo</span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando órdenes...</p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                {busqueda || filtroTipo !== 'todos' 
                  ? 'No se encontraron órdenes que coincidan con los criterios de búsqueda' 
                  : 'No hay órdenes de mantenimiento'}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {busqueda || filtroTipo !== 'todos' 
                  ? 'Intente con otros términos o elimine los filtros' 
                  : 'Crea la primera orden haciendo clic en "Nueva Orden"'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dispositivo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {ordenesPaginadas.map((orden) => (
                      <tr 
                        key={orden.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleRowClick(orden)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{orden.cliente?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{orden.cliente?.phone || 'Sin teléfono'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{orden.dispositivo?.marca || ''} {orden.dispositivo?.modelo || ''}</div>
                          <div className="text-sm text-gray-500">S/N: {orden.dispositivo?.numeroSerie || 'N/A'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(orden.tipoMantenimiento)}`}>
                            {orden.tipoMantenimiento}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {orden.fechaCreacion?.toLocaleDateString() || 'Fecha no disponible'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(orden);
                              }}
                              className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                              aria-label="Ver detalles"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                imprimirOrden(orden);
                              }}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                              aria-label="Imprimir orden"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Paginación */}
              {totalPaginas > 1 && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{indiceInicio + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(indiceInicio + elementosPorPagina, ordenesFiltradas.length)}
                    </span> de{' '}
                    <span className="font-medium">{ordenesFiltradas.length}</span> resultados
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-3 py-1 rounded-md border border-gray-300 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal de Visualización */}
        {ordenSeleccionada && (
          <ModalOrden 
            orden={ordenSeleccionada} 
            onClose={() => setOrdenSeleccionada(null)} 
            onPrint={imprimirOrden}
          />
        )}
      </div>
      <br />
      {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-green-100 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Preventivos</p>
                <p className="text-2xl font-bold text-green-600">
                  {ordenes.filter(o => o.tipoMantenimiento === 'preventivo').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Correctivos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {ordenes.filter(o => o.tipoMantenimiento === 'correctivo').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Órdenes</p>
                <p className="text-2xl font-bold text-blue-600">{ordenes.length}</p>
              </div>
            </div>
          </div>
        </div>
    </div>

    
  );
}