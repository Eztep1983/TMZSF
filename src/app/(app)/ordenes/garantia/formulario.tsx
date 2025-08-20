'use client'
import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenGarantia, Cliente, Dispositivo } from '@/types/orden'
import { ArrowLeft, Save } from 'lucide-react'

interface FormularioGarantiaProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FormularioGarantia({ onClose, onSuccess }: FormularioGarantiaProps) {
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
  
  const [fechaCompra, setFechaCompra] = useState('')
  const [descripcionProblema, setDescripcionProblema] = useState('')
  const [tiempoGarantia, setTiempoGarantia] = useState(12)
  const [condicionesGarantia, setCondicionesGarantia] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nuevaOrden: Omit<OrdenGarantia, 'id'> = {
        tipo: 'garantia',
        cliente,
        dispositivo,
        fechaCreacion: new Date(),
        fechaCompra: new Date(fechaCompra),
        descripcionProblema,
        tiempoGarantia,
        condicionesGarantia,
        estado: 'pendiente'
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
            <button onClick={onClose} className="text-blue-600 hover:text-blue-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Garantía</h1>
              <p className="text-gray-600">Complete la información del cliente y dispositivo</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Datos del Dispositivo */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos del Dispositivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Dispositivo *
                </label>
                <select
                  required
                  value={dispositivo.tipo}
                  onChange={(e) => setDispositivo({...dispositivo, tipo: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Información de Garantía */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de Garantía</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Compra *
                </label>
                <input
                  type="date"
                  required
                  value={fechaCompra}
                  onChange={(e) => setFechaCompra(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Garantía (meses) *
                </label>
                <select
                  required
                  value={tiempoGarantia}
                  onChange={(e) => setTiempoGarantia(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="3">3 meses</option>
                  <option value="6">6 meses</option>
                  <option value="12">12 meses</option>
                  <option value="24">24 meses</option>
                  <option value="36">36 meses</option>
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción del Problema *
              </label>
              <textarea
                required
                value={descripcionProblema}
                onChange={(e) => setDescripcionProblema(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describa en detalle el problema que presenta el dispositivo..."
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Condiciones de Garantía
              </label>
              <textarea
                value={condicionesGarantia}
                onChange={(e) => setCondicionesGarantia(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Especifique las condiciones particulares de esta garantía..."
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Orden
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}