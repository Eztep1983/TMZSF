// app/ordenes/diagnostico/formulario.tsx
'use client'
import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenDiagnostico, Cliente, Dispositivo } from '@/types/orden'
import { ArrowLeft, Save } from 'lucide-react'

interface FormularioDiagnosticoProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FormularioDiagnostico({ onClose, onSuccess }: FormularioDiagnosticoProps) {
  const [loading, setLoading] = useState(false)
  const [cliente, setCliente] = useState<Cliente>({
    id: '',
    nombre: '',
    telefono: '',
    email: '',
    direccion: '',
    observations: '',
    equipo: ''
  })
  
  const [dispositivo, setDispositivo] = useState<Dispositivo>({
    tipo: '',
    marca: '',
    modelo: '',
    numeroSerie: ''
  })
  
  const [observacionesIniciales, setObservacionesIniciales] = useState('')
  const [pruebasRealizadas, setPruebasRealizadas] = useState('')
  const [posiblesCausas, setPosiblesCausas] = useState('')
  const [contadorMaquina, setContadorMaquina] = useState<number | undefined>(undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nuevaOrden: Omit<OrdenDiagnostico, 'id'> = {
        tipo: 'diagnostico',
        cliente,
        dispositivo,
        fechaCreacion: new Date(),
        observacionesIniciales,
        pruebasRealizadas,
        posiblesCausas,
        contadorMaquina,
        estado: 'pendiente',
        diagnosticoFinal: '',
        recomendaciones: ''
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
            <button onClick={onClose} className="text-orange-600 hover:text-orange-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Diagnóstico</h1>
              <p className="text-gray-600">Complete la información del diagnóstico técnico</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Datos del Cliente */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Seleccione el Cliente</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contador de Máquina (Solo para Impresoras/Fotocopiadoras)
                </label>
                <input
                  type="number"
                  min="0"
                  value={contadorMaquina || ''}
                  onChange={(e) => setContadorMaquina(e.target.value ? parseInt(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Ej: 45000"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Ingrese el número de páginas impresas que muestra el contador del equipo
                </p>
              </div>
            </div>
          </div>

          {/* Información del Diagnóstico */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Diagnóstico</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observaciones Técnicas Iniciales *
                </label>
                <textarea
                  required
                  rows={4}
                  value={observacionesIniciales}
                  onChange={(e) => setObservacionesIniciales(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Describa el estado inicial del equipo, síntomas reportados por el cliente, observaciones visuales, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pruebas Realizadas *
                </label>
                <textarea
                  required
                  rows={4}
                  value={pruebasRealizadas}
                  onChange={(e) => setPruebasRealizadas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Detalle las pruebas de funcionamiento realizadas: prueba de impresión, escaneo, conectividad, revisión de componentes, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posibles Causas del Problema *
                </label>
                <textarea
                  required
                  rows={4}
                  value={posiblesCausas}
                  onChange={(e) => setPosiblesCausas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Basándose en las observaciones y pruebas, indique las posibles causas del problema y recomendaciones de reparación..."
                />
              </div>
            </div>
          </div>

          {/* Notas Adicionales */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">Consejos para un buen diagnóstico:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Sea específico en las observaciones técnicas</li>
                <li>• Documente todas las pruebas realizadas</li>
                <li>• Incluya códigos de error si los hay</li>
                <li>• Tome fotos de componentes dañados si es necesario</li>
                <li>• Evalúe el costo estimado de reparación vs reemplazo</li>
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
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Diagnóstico'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}