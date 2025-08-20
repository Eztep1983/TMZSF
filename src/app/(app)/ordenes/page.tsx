// app/ordenes/page.tsx
'use client'
import Link from 'next/link'
import { 
  Shield, 
  Wrench, 
  Search, 
  Truck,
  FileText
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
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Órdenes de Servicio
          </h1>
          <p className="text-gray-600">
            Selecciona el tipo de orden que deseas gestionar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiposOrden.map((orden) => {
            const IconComponent = orden.icono
            return (
              <Link
                key={orden.tipo}
                href={orden.ruta}
                className={`${orden.color} text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <IconComponent className={`w-10 h-10 ${orden.colorIcon}`} />
                    <FileText className="w-6 h-6 text-white opacity-50" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    {orden.titulo}
                  </h3>
                  <p className="text-sm opacity-90">
                    {orden.descripcion}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Resumen de Actividades
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-600">Garantías Activas</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-600">Mantenimientos</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-orange-600">Diagnósticos</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-600">Entregas</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}