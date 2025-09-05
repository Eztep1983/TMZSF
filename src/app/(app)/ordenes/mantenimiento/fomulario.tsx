'use client'
import { useState, useEffect } from 'react'
import { OrdenMantenimiento, Cliente, Dispositivo } from '@/types/orden'
import { ArrowLeft, Save, Plus, Trash2, UserPlus, Monitor, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/auth/AuthProvider'
// IMPORTAR LOS HELPERS MULTI-USUARIO
import { 
  getClientesPorUsuario, 
  crearOrden,
  generarIdPersonalizado
} from '@/lib/multiuser-helpers'
import { obtenerProximoNumeroOrden, formatearIdOrden } from '@/lib/firebase-utils'

interface FormularioMantenimientoProps {
  onClose: () => void
  onSuccess: () => void
}

export default function FormularioMantenimiento({ onClose, onSuccess }: FormularioMantenimientoProps) {
  const router = useRouter()
  const { user } = useAuth() // OBTENER USUARIO AUTENTICADO
  const [loading, setLoading] = useState(false)
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null)
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState<Dispositivo | null>(null)
  const [busquedaCliente, setBusquedaCliente] = useState('')
  
  const [tipoMantenimiento, setTipoMantenimiento] = useState<'preventivo' | 'correctivo'>('preventivo')
  const [tareasRealizadas, setTareasRealizadas] = useState<string[]>([''])
  const [piezasUsadas, setPiezasUsadas] = useState<Array<{pieza: string, cantidad: number}>>([])
  const [estadoAntes, setEstadoAntes] = useState<string[]>([''])
  const [estadoDespues, setEstadoDespues] = useState<string[]>([''])
  const [garantiaTiempo, setGarantiaTiempo] = useState(3)
  const [garantiaDescripcion, setGarantiaDescripcion] = useState('')

  useEffect(() => {
    cargarClientes()
  }, [user?.uid])

  const cargarClientes = async () => {
    if (!user?.uid) return
    
    try {
      // USAR EL HELPER MULTI-USUARIO
      const clientesData = await getClientesPorUsuario(user.uid)
      setClientes(clientesData)
    } catch (error) {
      console.error('Error cargando clientes:', error)
    }
  }

  const clientesFiltrados = clientes.filter(cliente =>
    cliente.name.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    cliente.email.toLowerCase().includes(busquedaCliente.toLowerCase()) ||
    cliente.phone.includes(busquedaCliente)
  )

  const seleccionarCliente = (cliente: Cliente) => {
    setClienteSeleccionado(cliente)
    setDispositivoSeleccionado(null)
    setBusquedaCliente('')
  }

  const seleccionarDispositivo = (dispositivo: Dispositivo) => {
    setDispositivoSeleccionado(dispositivo)
  }

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
  e.preventDefault();
  
  if (!user?.uid) {
    alert('Usuario no autenticado');
    return;
  }
  
  if (!clienteSeleccionado) {
    alert('Por favor seleccione un cliente');
    return;
  }
  
  if (!dispositivoSeleccionado) {
    alert('Por favor seleccione un dispositivo');
    return;
  }

  setLoading(true);

  try {
    // OBTENER NÚMERO CONSECUTIVO EN LUGAR DE ID PERSONALIZADO ALEATORIO
    const proximoNumero = await obtenerProximoNumeroOrden('mantenimiento');
    const idPersonalizado = formatearIdOrden(proximoNumero, 'mantenimiento');

    // Filtrar piezas usadas para eliminar cualquier elemento undefined o vacío
    const piezasUsadasFiltradas = piezasUsadas
      .filter(pieza => pieza.pieza.trim() !== '')
      .map(pieza => ({
        pieza: pieza.pieza,
        cantidad: pieza.cantidad,
      }));

    // Crear la orden
    const nuevaOrden: Omit<OrdenMantenimiento, 'id'> = {
      tipo: 'mantenimiento',
      horaCreacion: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      cliente: clienteSeleccionado,
      dispositivo: dispositivoSeleccionado,
      fechaCreacion: new Date(),
      tipoMantenimiento,
      tareasRealizadas: tareasRealizadas.filter(tarea => tarea.trim() !== ''),
      piezasUsadas: piezasUsadasFiltradas.length > 0 ? piezasUsadasFiltradas : [],
      estadoAntes: estadoAntes.filter(estado => estado.trim() !== ''),
      estadoDespues: estadoDespues.filter(estado => estado.trim() !== ''),
      garantiaTiempo,
      garantiaDescripcion,
      idPersonalizado, // USAR EL ID CONSECUTIVO
      userId: user.uid // INCLUIR EL USER ID
      ,
    }

    // USAR EL HELPER MULTI-USUARIO PARA CREAR LA ORDEN
    await crearOrden(nuevaOrden, user.uid);
    
    console.log('Orden creada exitosamente con ID:', idPersonalizado);
    onSuccess();
  } catch (error) {
    console.error('Error creando orden:', error);
    alert('Error al crear la orden: ' + (error instanceof Error ? error.message : 'Error desconocido'));
  } finally {
    setLoading(false);
  }
};

  // VERIFICAR QUE EL USUARIO ESTÉ AUTENTICADO
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Debes iniciar sesión para crear órdenes.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <button 
              onClick={onClose} 
              className="text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Volver"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Nueva Orden de Mantenimiento</h1>
              <p className="text-gray-400">Complete la información del cliente, dispositivo y el trabajo realizado</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selección de Cliente */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-white">Selecciona el Cliente</h2>
              <button
                type="button"
                onClick={() => router.push('/clientes/nuevo')}
                className="text-blue-400 hover:text-blue-300 flex items-center text-sm transition-colors"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Nuevo Cliente
              </button>
            </div>
            
            {!clienteSeleccionado ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre, email o teléfono..."
                    value={busquedaCliente}
                    onChange={(e) => setBusquedaCliente(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                
                {busquedaCliente && (
                  <div className="max-h-60 overflow-y-auto border border-gray-700 rounded-lg bg-gray-800">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map((cliente) => (
                        <div
                          key={cliente.id}
                          onClick={() => seleccionarCliente(cliente)}
                          className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
                        >
                          <div className="font-medium text-white">{cliente.name}</div>
                          <div className="text-sm text-gray-300">{cliente.email} | {cliente.phone}</div>
                          <div className="text-xs text-gray-500">{cliente.dispositivos?.length || 0} dispositivo(s)</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">
                        No se encontraron clientes
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-blue-300">{clienteSeleccionado.name}</h3>
                    <p className="text-sm text-blue-400/80">{clienteSeleccionado.email} | {clienteSeleccionado.phone}</p>
                    <p className="text-sm text-blue-400/70">{clienteSeleccionado.address}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setClienteSeleccionado(null)}
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Selección de Dispositivo */}
          {clienteSeleccionado && (
            <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Monitor className="w-5 h-5 mr-2 text-blue-400" />
                Seleccionar Dispositivo
              </h2>
              
              {!dispositivoSeleccionado ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {clienteSeleccionado.dispositivos && clienteSeleccionado.dispositivos.length > 0 ? (
                    clienteSeleccionado.dispositivos.map((dispositivo) => (
                      <div
                        key={dispositivo.id}
                        onClick={() => seleccionarDispositivo(dispositivo)}
                        className="p-4 border border-gray-700 rounded-lg hover:bg-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <div className="font-medium text-white">{dispositivo.tipo}</div>
                        <div className="text-sm text-gray-300">{dispositivo.marca} {dispositivo.modelo}</div>
                        <div className="text-xs text-gray-500">S/N: {dispositivo.numeroSerie}</div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <Monitor className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Este cliente no tiene dispositivos registrados</p>
                      <button
                        type="button"
                        onClick={() => router.push(`/clientes/${clienteSeleccionado.id}/editar`)}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        Agregar dispositivos al cliente
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-blue-300">{dispositivoSeleccionado.tipo}</h3>
                      <p className="text-sm text-blue-400/80">{dispositivoSeleccionado.marca} {dispositivoSeleccionado.modelo}</p>
                      <p className="text-sm text-blue-400/70">S/N: {dispositivoSeleccionado.numeroSerie}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setDispositivoSeleccionado(null)}
                      className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                    >
                      Cambiar
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Información del Mantenimiento - Solo visible si hay cliente y dispositivo seleccionados */}
          {clienteSeleccionado && dispositivoSeleccionado && (
            <>
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Información del Mantenimiento</h2>
                
                {/* Tipo de Mantenimiento */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo de Mantenimiento *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="tipoMantenimiento"
                        value="preventivo"
                        checked={tipoMantenimiento === 'preventivo'}
                        onChange={(e) => setTipoMantenimiento(e.target.value as 'preventivo' | 'correctivo')}
                        className="mr-3 text-blue-500"
                      />
                      <div>
                        <div className="font-medium text-green-400">Preventivo</div>
                        <div className="text-sm text-gray-400">Mantenimiento programado regular</div>
                      </div>
                    </label>
                    <label className="flex items-center p-4 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors">
                      <input
                        type="radio"
                        name="tipoMantenimiento"
                        value="correctivo"
                        checked={tipoMantenimiento === 'correctivo'}
                        onChange={(e) => setTipoMantenimiento(e.target.value as 'preventivo' | 'correctivo')}
                        className="mr-3 text-blue-500"
                      />
                      <div>
                        <div className="font-medium text-orange-400">Correctivo</div>
                        <div className="text-sm text-gray-400">Reparación por falla o problema</div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Tareas Realizadas */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Tareas Realizadas *
                    </label>
                    <button
                      type="button"
                      onClick={agregarTarea}
                      className="text-blue-400 hover:text-blue-300 flex items-center text-sm transition-colors"
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
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        {tareasRealizadas.length > 1 && (
                          <button
                            type="button"
                            onClick={() => eliminarTarea(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
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
                    <label className="block text-sm font-medium text-gray-300">
                      Piezas Usadas (Opcional)
                    </label>
                    <button
                      type="button"
                      onClick={agregarPieza}
                      className="text-blue-400 hover:text-blue-300 flex items-center text-sm transition-colors"
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
                          className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        <input
                          type="number"
                          value={pieza.cantidad}
                          onChange={(e) => actualizarPieza(index, 'cantidad', parseInt(e.target.value))}
                          placeholder="Cant."
                          min="1"
                          className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                        <button
                          type="button"
                          onClick={() => eliminarPieza(index)}
                          className="text-red-400 hover:text-red-300 transition-colors"
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
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Estado del Equipo</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Estado Antes */}
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-300">
                        Estado Antes
                      </label>
                      <button
                        type="button"
                        onClick={agregarEstadoAntes}
                        className="text-blue-400 hover:text-blue-300 flex items-center text-sm transition-colors"
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
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                          {estadoAntes.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarEstadoAntes(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
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
                      <label className="block text-sm font-medium text-gray-300">
                        Estado Después
                      </label>
                      <button
                        type="button"
                        onClick={agregarEstadoDespues}
                        className="text-blue-400 hover:text-blue-300 flex items-center text-sm transition-colors"
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
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          />
                          {estadoDespues.length > 1 && (
                            <button
                              type="button"
                              onClick={() => eliminarEstadoDespues(index)}
                              className="text-red-400 hover:text-red-300 transition-colors"
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
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Garantía del Trabajo</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tiempo de Garantía (meses) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      max="24"
                      value={garantiaTiempo}
                      onChange={(e) => setGarantiaTiempo(parseInt(e.target.value))}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Descripción de Garantía *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={garantiaDescripcion}
                      onChange={(e) => setGarantiaDescripcion(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Especifique qué cubre la garantía..."
                    />
                  </div>
                </div>
              </div>

              {/* Botones de Acción */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 disabled:opacity-50 transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{loading ? 'Guardando...' : 'Guardar Orden'}</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  )
}