'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenDiagnostico } from '@/types/orden'
import { Plus, Search, Eye, Printer, ArrowLeft, SearchIcon } from 'lucide-react'
import Link from 'next/link'
import FormularioDiagnostico from '@/app/(app)/ordenes/diagnostico/formulario'

export default function OrdenesDiagnosticoPage() {
  const [ordenes, setOrdenes] = useState<OrdenDiagnostico[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenDiagnostico | null>(null)

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = async () => {
    try {
      const q = query(
        collection(db, 'ordenes'),
        where('tipo', '==', 'diagnostico'),
        orderBy('fechaCreacion', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const ordenesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate(),
        fechaCompra: doc.data().fechaCompra?.toDate()
      })) as OrdenDiagnostico[]
      setOrdenes(ordenesData)
    } catch (error) {
      console.error('Error cargando órdenes:', error)
    } finally {
      setLoading(false)
    }
  }

  const ordenesFiltradas = ordenes.filter(orden =>
    orden.cliente.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    orden.dispositivo.modelo.toLowerCase().includes(busqueda.toLowerCase()) ||
    orden.dispositivo.numeroSerie.toLowerCase().includes(busqueda.toLowerCase()) ||
    orden.observacionesIniciales.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiene': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (mostrarFormulario) {
    return (
      <FormularioDiagnostico
        onClose={() => setMostrarFormulario(false)}
        onSuccess={() => {
          setMostrarFormulario(false)
          cargarOrdenes()
        }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/ordenes" className="text-orange-600 hover:text-orange-800">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <SearchIcon className="w-8 h-8 text-orange-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Órdenes de Diagnóstico</h1>
                  <p className="text-gray-600">Evaluación técnica y diagnóstico de problemas</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, modelo, número de serie o problema..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando órdenes...</p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <SearchIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay órdenes de diagnóstico</p>
              <p className="text-sm text-gray-500">Crea la primera orden haciendo clic en "Nueva Orden"</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dispositivo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Observaciones Iniciales
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contador
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
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
                  {ordenesFiltradas.map((orden) => (
                    <tr key={orden.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{orden.cliente.nombre}</div>
                        <div className="text-sm text-gray-500">{orden.cliente.telefono}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{orden.dispositivo.marca} {orden.dispositivo.modelo}</div>
                        <div className="text-sm text-gray-500">S/N: {orden.dispositivo.numeroSerie}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {orden.observacionesIniciales}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {orden.contadorMaquina ? orden.contadorMaquina.toLocaleString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(orden.estado)}`}>
                          {orden.estado.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {orden.fechaCreacion?.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setOrdenSeleccionada(orden)}
                            className="text-orange-600 hover:text-orange-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => window.print()}
                            className="text-blue-600 hover:text-blue-900"
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
          )}
        </div>

        {/* Modal de Visualización */}
        {ordenSeleccionada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Orden de Diagnóstico #{ordenSeleccionada.id?.substring(0, 8)}</h3>
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Cliente</h4>
                    <p className="text-sm"><span className="font-medium">Nombre:</span> {ordenSeleccionada.cliente.nombre}</p>
                    <p className="text-sm"><span className="font-medium">Teléfono:</span> {ordenSeleccionada.cliente.telefono}</p>
                    <p className="text-sm"><span className="font-medium">Email:</span> {ordenSeleccionada.cliente.email || 'N/A'}</p>
                    <p className="text-sm"><span className="font-medium">Dirección:</span> {ordenSeleccionada.cliente.direccion}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Dispositivo</h4>
                    <p className="text-sm"><span className="font-medium">Tipo:</span> {ordenSeleccionada.dispositivo.tipo}</p>
                    <p className="text-sm"><span className="font-medium">Marca:</span> {ordenSeleccionada.dispositivo.marca}</p>
                    <p className="text-sm"><span className="font-medium">Modelo:</span> {ordenSeleccionada.dispositivo.modelo}</p>
                    <p className="text-sm"><span className="font-medium">Número de Serie:</span> {ordenSeleccionada.dispositivo.numeroSerie}</p>
                    {ordenSeleccionada.contadorMaquina && (
                      <p className="text-sm"><span className="font-medium">Contador:</span> {ordenSeleccionada.contadorMaquina.toLocaleString()}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Estado</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEstadoColor(ordenSeleccionada.estado)}`}>
                      {ordenSeleccionada.estado.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Fechas</h4>
                    <p className="text-sm"><span className="font-medium">Creación:</span> {ordenSeleccionada.fechaCreacion?.toLocaleDateString()}</p>
                    {ordenSeleccionada.fechaCompra && (
                      <p className="text-sm"><span className="font-medium">Compra:</span> {ordenSeleccionada.fechaCompra?.toLocaleDateString()}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Observaciones Iniciales</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg">{ordenSeleccionada.observacionesIniciales}</p>
                </div>
                
                {ordenSeleccionada.pruebasRealizadas && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Pruebas Realizadas</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{ordenSeleccionada.pruebasRealizadas}</p>
                  </div>
                )}
                
                {ordenSeleccionada.posiblesCausas && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Posibles Causas</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{ordenSeleccionada.posiblesCausas}</p>
                  </div>
                )}
                
                {ordenSeleccionada.diagnosticoFinal && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Diagnóstico Final</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{ordenSeleccionada.diagnosticoFinal}</p>
                  </div>
                )}
                
                {ordenSeleccionada.recomendaciones && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Recomendaciones</h4>
                    <p className="text-sm bg-gray-50 p-3 rounded-lg">{ordenSeleccionada.recomendaciones}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}