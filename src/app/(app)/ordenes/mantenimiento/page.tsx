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
            id: doc.id, // Ahora el ID será el personalizado (OMAN01, etc.)
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

  // Filtro con verificaciones de seguridad
  const ordenesFiltradas = ordenes.filter(orden =>
    (orden.cliente?.phone?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (orden.cliente?.name?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (orden.dispositivo?.modelo?.toLowerCase() || '').includes(busqueda.toLowerCase()) ||
    (orden.dispositivo?.numeroSerie?.toLowerCase() || '').includes(busqueda.toLowerCase())
  )

  const getTipoColor = (tipo: string) => {
    return tipo === 'preventivo' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
  }

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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <Link href="/ordenes" className="text-green-600 hover:text-green-800 self-start sm:self-auto">
                  <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-start sm:items-center gap-3">
                  <Wrench className="w-8 h-8 text-green-600" />
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
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 self-start sm:self-auto"
              >
                <Plus className="w-5 h-5" />
                <span className="text-sm sm:text-base">Nueva Orden</span>
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
                <p className="text-sm text-gray-600">Total Órdenes de Mantenimiento</p>
                <p className="text-2xl font-bold text-blue-600">{ordenes.length}</p>
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
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {orden.tareasRealizadas?.length || 0} tarea(s)
                        </div>
                        <div className="text-xs text-gray-500">
                          {orden.tareasRealizadas?.[0] && `${orden.tareasRealizadas[0].substring(0, 30)}...`}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {orden.fechaCreacion?.toLocaleDateString() || 'Fecha no disponible'}
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
                            onClick={() => imprimirOrden(orden)}
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
                    <p>{ordenSeleccionada.cliente?.name || 'N/A'}</p>
                    <p>{ordenSeleccionada.cliente?.phone || 'N/A'} | {ordenSeleccionada.cliente?.email || 'N/A'}</p>
                    <p>{ordenSeleccionada.cliente?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Dispositivo</h4>
                    <p>{ordenSeleccionada.dispositivo?.marca || ''} {ordenSeleccionada.dispositivo?.modelo || ''}</p>
                    <p>Número de Serie: {ordenSeleccionada.dispositivo?.numeroSerie || 'N/A'}</p>
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
                      {ordenSeleccionada.tareasRealizadas?.map((tarea, index) => (
                        <li key={index}>{tarea}</li>
                      )) || <li>No se registraron tareas</li>}
                    </ul>
                  </div>
                  {ordenSeleccionada.piezasUsadas && ordenSeleccionada.piezasUsadas.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900">Piezas Usadas</h4>
                      <ul className="text-sm">
                        {ordenSeleccionada.piezasUsadas.map((pieza, index) => (
                          <li key={index}>
                            {pieza.cantidad}x {pieza.pieza} 
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <h4 className="font-semibold text-gray-900">Garantía</h4>
                    <p>{ordenSeleccionada.garantiaTiempo || 0} meses</p>
                    <p className="text-sm">{ordenSeleccionada.garantiaDescripcion || 'No se especificó garantía'}</p>
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