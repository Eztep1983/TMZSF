// app/ordenes/page.tsx
'use client'
import Link from 'next/link'
import { 
  Shield, 
  Wrench, 
  Search, 
  Truck,
  FileText,
  PlusCircle,
  UserPlus
} from 'lucide-react'

export default function OrdenesPage() {
  const tiposOrden = [
    {
      tipo: 'garantia',
      titulo: 'Orden de Garantía',
      descripcion: 'Gestión de reclamos y servicios bajo garantía',
      icono: Shield,
      color: 'bg-blue-500 hover:bg-blue-600',
      colorIcon: 'text-blue-100',
      ruta: '/ordenes/garantia'
    },
    {
      tipo: 'mantenimiento',
      titulo: 'Orden de Mantenimiento',
      descripcion: 'Mantenimiento preventivo y correctivo de equipos',
      icono: Wrench,
      color: 'bg-green-500 hover:bg-green-600',
      colorIcon: 'text-green-100',
      ruta: '/ordenes/mantenimiento'
    },
    {
      tipo: 'diagnostico',
      titulo: 'Orden de Diagnóstico',
      descripcion: 'Evaluación técnica y diagnóstico de problemas',
      icono: Search,
      color: 'bg-orange-500 hover:bg-orange-600',
      colorIcon: 'text-orange-100',
      ruta: '/ordenes/diagnostico'
    },
    {
      tipo: 'entrega',
      titulo: 'Orden de Entrega',
      descripcion: 'Entrega de equipos reparados al cliente',
      icono: Truck,
      color: 'bg-purple-500 hover:bg-purple-600',
      colorIcon: 'text-purple-100',
      ruta: '/ordenes/entrega'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Gestión de Órdenes de Servicio
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Selecciona el tipo de orden que deseas gestionar
            </p>
          </div>
          
          <Link 
            href="/clientes/nuevo"
            className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 w-full sm:w-auto"
          >
            <UserPlus size={20} />
            <span>Añadir Cliente</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {tiposOrden.map((orden) => {
            const IconComponent = orden.icono
            return (
              <Link
                key={orden.tipo}
                href={orden.ruta}
                className={`${orden.color} text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full`}
              >
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${orden.colorIcon}`} />
                    <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white opacity-50" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2">
                    {orden.titulo}
                  </h3>
                  <p className="text-xs sm:text-sm opacity-90 mt-auto">
                    {orden.descripcion}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
        
        {/* Sección de acciones rápidas para móviles */}
        <div className="lg:hidden fixed bottom-6 right-6 z-10">
          <Link 
            href="/clientes/nuevo"
            className="flex items-center justify-center w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 transition-colors duration-200"
          >
            <PlusCircle size={24} />
          </Link>
        </div>
      </div>
    </div>
  )
}