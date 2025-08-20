// app/ordenes/entrega/formulario.tsx
'use client'
import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@//lib/firebase'
import { OrdenEntrega, Cliente, Dispositivo } from '@/types/orden'
import { ArrowLeft, Save, CheckCircle } from 'lucide-react'

interface FormularioEntregaProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FormularioEntrega({ onClose, onSuccess }: FormularioEntregaProps) {
  const [loading, setLoading] = useState(false)
  const [cliente, setCliente] = useState<Cliente>({
    nombre: '',
    telefono: '',
    email: '',
    direccion: ''
  })
  
  const [dispositivo, setDispositivo] = useState<Dispositivo>({
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: ''
  })
  
  const [observacionesFinales, setObservacionesFinales] = useState('')
  const [firmaCliente, setFirmaCliente] = useState('')
  const [validacionCliente, setValidacionCliente] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nuevaOrden: Omit<OrdenEntrega, 'id'> = {
        tipo: 'entrega',
        cliente,
        dispositivo,
        fechaCreacion: new Date(),
        fechaEntrega: new Date(), // Fecha automática al día en que se genera
        observacionesFinales,
        firmaCliente,
        validacionCliente,
        estado: validacionCliente ? 'completada' : 'pendiente'
      }

      await addDoc(collection(db, 'ordenes'), nuevaOrden)
      onSuccess()
    } catch (error) {
      console.error('Error creando orden:', error)
      alert('Error al crear la orden')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="text-purple-600 hover:text-purple-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Entrega</h1>
              <p className="text-gray-600">Complete la información para la entrega del equipo reparado</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información de Entrega */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Información de Entrega</h2>
                <p className="text-sm text-gray-600">Fecha de entrega: {new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Datos del Cliente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  value={cliente.nombre}
                  onChange={(e) => setCliente({...cliente, nombre: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  required
                  value={cliente.telefono}
                  onChange={(e) => setCliente({...cliente, telefono: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={cliente.email}
                  onChange={(e) => setCliente({...cliente, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección *
                </label>
                <input
                  type="text"
                  required
                  value={cliente.direccion}
                  onChange={(e) => setCliente({...cliente, direccion: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Datos del Dispositivo */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos del Dispositivo Entregado</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Dispositivo *
                </label>
                <select
                  required
                  value={dispositivo.tipo}
                  onChange={(e) => setDispositivo({...dispositivo, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Seleccionar...</option>
                  <option value="impresora">Impresora</option>
                  <option value="fotocopiadora">Fotocopiadora</option>
                  <option value="multifuncional">Multifuncional</option>
                  <option value="escaner">Escáner</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marca *
                </label>
                <input
                  type="text"
                  required
                  value={dispositivo.marca}
                  onChange={(e) => setDispositivo({...dispositivo, marca: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={dispositivo.modelo}
                  onChange={(e) => setDispositivo({...dispositivo, modelo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Serie *
                </label>
                <input
                  type="text"
                  required
                  value={dispositivo.numeroSerie}
                  onChange={(e) => setDispositivo({...dispositivo, numeroSerie: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Observaciones Finales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Observaciones Finales</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del trabajo realizado y estado final del equipo *
              </label>
              <textarea
                required
                rows={4}
                value={observacionesFinales}
                onChange={(e) => setObservacionesFinales(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detalle las reparaciones realizadas, piezas cambiadas, pruebas efectuadas y el estado actual del equipo..."
              />
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Información importante para incluir:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Reparaciones y mantenimiento realizados</li>
                <li>• Piezas reemplazadas (si las hay)</li>
                <li>• Pruebas de funcionamiento efectuadas</li>
                <li>• Recomendaciones de uso y mantenimiento</li>
                <li>• Garantía del trabajo realizado</li>
              </ul>
            </div>
          </div>

          {/* Validación del Cliente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Validación del Cliente</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Firma o Nombre del Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={firmaCliente}
                  onChange={(e) => setFirmaCliente(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Nombre completo del cliente que recibe el equipo"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="validacionCliente"
                  checked={validacionCliente}
                  onChange={(e) => setValidacionCliente(e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="validacionCliente" className="ml-2 block text-sm text-gray-900">
                  El cliente confirma haber recibido el equipo en buen estado y acepta el trabajo realizado
                </label>
              </div>

              {validacionCliente && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      Cliente validó la entrega. La orden se marcará como completada.
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Términos y Condiciones */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Términos de Entrega</h2>
            <div className="text-sm text-gray-700 space-y-2">
              <p>Al firmar esta orden de entrega, el cliente acepta:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Haber recibido el equipo en las condiciones acordadas</li>
                <li>Que el trabajo realizado cumple con lo solicitado</li>
                <li>Los términos de garantía del servicio prestado</li>
                <li>Que el equipo ha sido probado y funciona correctamente</li>
              </ul>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Registrar Entrega'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}