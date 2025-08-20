// app/ordenes/mantenimiento/formulario.tsx
'use client'
import { useState } from 'react'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { OrdenMantenimiento, Cliente, Dispositivo } from '@/types/orden'
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react'

interface FormularioMantenimientoProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FormularioMantenimiento({ onClose, onSuccess }: FormularioMantenimientoProps) {
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
  
  const [tipoMantenimiento, setTipoMantenimiento] = useState<'preventivo' | 'correctivo'>('preventivo')
  const [tareasRealizadas, setTareasRealizadas] = useState<string[]>([''])
  const [piezasUsadas, setPiezasUsadas] = useState<Array<{pieza: string, cantidad: number, precio?: number}>>([])
  const [estadoAntes, setEstadoAntes] = useState<string[]>([''])
  const [estadoDespues, setEstadoDespues] = useState<string[]>([''])
  const [garantiaTiempo, setGarantiaTiempo] = useState(3)
  const [garantiaDescripcion, setGarantiaDescripcion] = useState('')

  const agregarTarea = () => {
    setTareasRealizadas([...tareasRealizadas, ''])
  }

  const eliminarTarea = (index: number) => {
    setTareasRealizadas(tareasRealizadas.filter((_, i) => i !== index))
  }

  const actualizarTarea = (index: number, valor: string) => {
    const nuevasTareas = [...tareasRealizadas]
    nuevasTareas[index] = valor
    setTareasRealizadas(nuevasTareas)
  }

  const agregarPieza = () => {
    setPiezasUsadas([...piezasUsadas, { pieza: '', cantidad: 1 }])
  }

  const eliminarPieza = (index: number) => {
    setPiezasUsadas(piezasUsadas.filter((_, i) => i !== index))
  }

  const actualizarPieza = (index: number, campo: string, valor: any) => {
    const nuevasPiezas = [...piezasUsadas]
    nuevasPiezas[index] = { ...nuevasPiezas[index], [campo]: valor }
    setPiezasUsadas(nuevasPiezas)
  }

  const agregarEstadoAntes = () => {
    setEstadoAntes([...estadoAntes, ''])
  }

  const eliminarEstadoAntes = (index: number) => {
    setEstadoAntes(estadoAntes.filter((_, i) => i !== index))
  }

  const actualizarEstadoAntes = (index: number, valor: string) => {
    const nuevosEstados = [...estadoAntes]
    nuevosEstados[index] = valor
    setEstadoAntes(nuevosEstados)
  }

  const agregarEstadoDespues = () => {
    setEstadoDespues([...estadoDespues, ''])
  }

  const eliminarEstadoDespues = (index: number) => {
    setEstadoDespues(estadoDespues.filter((_, i) => i !== index))
  }

  const actualizarEstadoDespues = (index: number, valor: string) => {
    const nuevosEstados = [...estadoDespues]
    nuevosEstados[index] = valor
    setEstadoDespues(nuevosEstados)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const nuevaOrden: Omit<OrdenMantenimiento, 'id'> = {
        tipo: 'mantenimiento',
        cliente,
        dispositivo,
        fechaCreacion: new Date(),
        tipoMantenimiento,
        tareasRealizadas: tareasRealizadas.filter(tarea => tarea.trim() !== ''),
        piezasUsadas: piezasUsadas.length > 0 ? piezasUsadas.filter(pieza => pieza.pieza.trim() !== '') : undefined,
        estadoAntes: estadoAntes.filter(estado => estado.trim() !== ''),
        estadoDespues: estadoDespues.filter(estado => estado.trim() !== ''),
        garantiaTiempo,
        garantiaDescripcion,
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <button onClick={onClose} className="text-green-600 hover:text-green-800">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Nueva Orden de Mantenimiento</h1>
              <p className="text-gray-600">Complete la información del cliente y el trabajo realizado</p>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Información del Mantenimiento */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información del Mantenimiento</h2>
            
            {/* Tipo de Mantenimiento */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Mantenimiento *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="tipoMantenimiento"
                    value="preventivo"
                    checked={tipoMantenimiento === 'preventivo'}
                    onChange={(e) => setTipoMantenimiento(e.target.value as 'preventivo' | 'correctivo')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-green-600">Preventivo</div>
                    <div className="text-sm text-gray-500">Mantenimiento programado regular</div>
                  </div>
                </label>
                <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="tipoMantenimiento"
                    value="correctivo"
                    checked={tipoMantenimiento === 'correctivo'}
                    onChange={(e) => setTipoMantenimiento(e.target.value as 'preventivo' | 'correctivo')}
                    className="mr-3"
                  />
                  <div>
                    <div className="font-medium text-orange-600">Correctivo</div>
                    <div className="text-sm text-gray-500">Reparación por falla o problema</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Tareas Realizadas */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Tareas Realizadas *
                </label>
                <button
                  type="button"
                  onClick={agregarTarea}
                  className="text-green-600 hover:text-green-800 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar tarea
                </button>
              </div>
              <div className="space-y-3">
                {tareasRealizadas.map((tarea, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={tarea}
                      onChange={(e) => actualizarTarea(index, e.target.value)}
                      placeholder={`Tarea ${index + 1}...`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    {tareasRealizadas.length > 1 && (
                      <button
                        type="button"
                        onClick={() => eliminarTarea(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Piezas Usadas (Opcional) */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Piezas Usadas (Opcional)
                </label>
                <button
                  type="button"
                  onClick={agregarPieza}
                  className="text-green-600 hover:text-green-800 flex items-center text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Agregar pieza
                </button>
              </div>
              <div className="space-y-3">
                {piezasUsadas.map((pieza, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={pieza.pieza}
                      onChange={(e) => actualizarPieza(index, 'pieza', e.target.value)}
                      placeholder="Nombre de la pieza"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={pieza.cantidad}
                      onChange={(e) => actualizarPieza(index, 'cantidad', parseInt(e.target.value))}
                      placeholder="Cant."
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      value={pieza.precio || ''}
                      onChange={(e) => actualizarPieza(index, 'precio', e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="Precio"
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => eliminarPieza(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {piezasUsadas.length === 0 && (
                  <p className="text-gray-500 text-sm italic">No se han agregado piezas</p>
                )}
              </div>
            </div>
          </div>

          {/* Estado del Equipo */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Estado del Equipo</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Estado Antes */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado Antes
                  </label>
                  <button
                    type="button"
                    onClick={agregarEstadoAntes}
                    className="text-green-600 hover:text-green-800 flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {estadoAntes.map((estado, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={estado}
                        onChange={(e) => actualizarEstadoAntes(index, e.target.value)}
                        placeholder={`Observación ${index + 1}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {estadoAntes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarEstadoAntes(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Estado Después */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Estado Después
                  </label>
                  <button
                    type="button"
                    onClick={agregarEstadoDespues}
                    className="text-green-600 hover:text-green-800 flex items-center text-sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </button>
                </div>
                <div className="space-y-3">
                  {estadoDespues.map((estado, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={estado}
                        onChange={(e) => actualizarEstadoDespues(index, e.target.value)}
                        placeholder={`Observación ${index + 1}...`}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      {estadoDespues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => eliminarEstadoDespues(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Garantía */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Garantía del Trabajo</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de Garantía (meses) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="24"
                  value={garantiaTiempo}
                  onChange={(e) => setGarantiaTiempo(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción de Garantía *
                </label>
                <textarea
                  required
                  rows={3}
                  value={garantiaDescripcion}
                  onChange={(e) => setGarantiaDescripcion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="Especifique qué cubre la garantía..."
                />
              </div>
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
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Guardando...' : 'Guardar Orden'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}