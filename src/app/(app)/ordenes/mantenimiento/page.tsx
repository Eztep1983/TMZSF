// app/ordenes/mantenimiento/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenMantenimiento } from '@/types/orden'
import { Plus, Search, Eye, Printer, ArrowLeft, Wrench } from 'lucide-react'
import Link from 'next/link'
import FormularioMantenimiento from '@/app/(app)/ordenes/mantenimiento/fomulario'

export default function OrdenesMantenimientoPage() {
  const [ordenes, setOrdenes] = useState<OrdenMantenimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenMantenimiento | null>(null)

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = async () => {
    try {
      const q = query(
        collection(db, 'ordenes'),
        where('tipo', '==', 'mantenimiento'),
        orderBy('fechaCreacion', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const ordenesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate()
      })) as OrdenMantenimiento[]
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
    orden.dispositivo.numeroSerie.toLowerCase().includes(busqueda.toLowerCase())
  )

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800'
      case 'en_proceso': return 'bg-blue-100 text-blue-800'
      case 'completada': return 'bg-green-100 text-green-800'
      case 'cancelada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTipoColor = (tipo: string) => {
    return tipo === 'preventivo' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
  }

  if (mostrarFormulario) {
    return (
      <FormularioMantenimiento
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
              <Link href="/ordenes" className="text-green-600 hover:text-green-800">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div className="flex items-center space-x-3">
                <Wrench className="w-8 h-8 text-green-600" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Órdenes de Mantenimiento</h1>
                  <p className="text-gray-600">Mantenimiento preventivo y correctivo de equipos</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Nueva Orden</span>
            </button>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
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
          <div className="bg-white rounded-lg shadow-sm p-4">
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
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">En Proceso</p>
                <p className="text-2xl font-bold text-blue-600">
                  {ordenes.filter(o => o.estado === 'en_proceso').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Buscador */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por cliente, modelo o número de serie..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando órdenes...</p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <Wrench className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay órdenes de mantenimiento</p>
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
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tareas
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(orden.tipoMantenimiento)}`}>
                          {orden.tipoMantenimiento}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {orden.tareasRealizadas.length} tarea(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          {orden.tareasRealizadas[0] && `${orden.tareasRealizadas[0].substring(0, 30)}...`}
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
                            className="text-green-600 hover:text-green-900"
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
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Orden de Mantenimiento #{ordenSeleccionada.id}</h3>
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Cliente</h4>
                    <p>{ordenSeleccionada.cliente.nombre}</p>
                    <p>{ordenSeleccionada.cliente.telefono} | {ordenSeleccionada.cliente.email}</p>
                    <p>{ordenSeleccionada.cliente.direccion}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Dispositivo</h4>
                    <p>{ordenSeleccionada.dispositivo.marca} {ordenSeleccionada.dispositivo.modelo}</p>
                    <p>Número de Serie: {ordenSeleccionada.dispositivo.numeroSerie}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tipo de Mantenimiento</h4>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTipoColor(ordenSeleccionada.tipoMantenimiento)}`}>
                      {ordenSeleccionada.tipoMantenimiento}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900">Tareas Realizadas</h4>
                    <ul className="list-disc list-inside text-sm">
                      {ordenSeleccionada.tareasRealizadas.map((tarea, index) => (
                        <li key={index}>{tarea}</li>
                      ))}
                    </ul>
                  </div>
                  {ordenSeleccionada.piezasUsadas && ordenSeleccionada.piezasUsadas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Piezas Usadas</h4>
                      <ul className="text-sm">
                        {ordenSeleccionada.piezasUsadas.map((pieza, index) => (
                          <li key={index}>
                            {pieza.cantidad}x {pieza.pieza} 
                            {pieza.precio && ` - $${pieza.precio}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">Garantía</h4>
                    <p>{ordenSeleccionada.garantiaTiempo} meses</p>
                    <p className="text-sm">{ordenSeleccionada.garantiaDescripcion}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}