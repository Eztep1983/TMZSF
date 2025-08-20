// app/ordenes/garantia/page.tsx
'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenGarantia } from '@/types/orden'
import { Plus, Search, Eye, Printer, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import FormularioGarantia from './formulario'

export default function OrdenesGarantiaPage() {
  const [ordenes, setOrdenes] = useState<OrdenGarantia[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [mostrarFormulario, setMostrarFormulario] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenGarantia | null>(null)

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = async () => {
    try {
      const q = query(
        collection(db, 'ordenes'),
        where('tipo', '==', 'garantia'),
        orderBy('fechaCreacion', 'desc')
      )
      const querySnapshot = await getDocs(q)
      const ordenesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        fechaCreacion: doc.data().fechaCreacion?.toDate(),
        fechaCompra: doc.data().fechaCompra?.toDate()
      })) as OrdenGarantia[]
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

  const imprimirOrden = (orden: OrdenGarantia) => {
    window.print()
  }

  if (mostrarFormulario) {
    return (
      <FormularioGarantia
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
              <Link href="/ordenes" className="text-blue-600 hover:text-blue-800">
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Órdenes de Garantía</h1>
                <p className="text-gray-600">Gestión de reclamos y servicios bajo garantía</p>
              </div>
            </div>
            <button
              onClick={() => setMostrarFormulario(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
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
              placeholder="Buscar por cliente, modelo o número de serie..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Lista de Órdenes */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Cargando órdenes...</p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-gray-600">No hay órdenes de garantía</p>
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
                      Problema
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
                          {orden.descripcionProblema}
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
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => imprimirOrden(orden)}
                            className="text-green-600 hover:text-green-900"
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
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Orden de Garantía #{ordenSeleccionada.id}</h3>
                <button
                  onClick={() => setOrdenSeleccionada(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
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
                  <h4 className="font-semibold text-gray-900">Problema</h4>
                  <p>{ordenSeleccionada.descripcionProblema}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Garantía</h4>
                  <p>Tiempo: {ordenSeleccionada.tiempoGarantia} meses</p>
                  <p>Condiciones: {ordenSeleccionada.condicionesGarantia}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}