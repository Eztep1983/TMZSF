import { ClienteForm } from "@/components/clientes/ClienteForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function NuevoClientePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <UserPlus className="w-8 h-8 mr-3 text-green-600" />
              Nuevo Cliente
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link href="/clientes">
              <ArrowLeft className="w-4 h-4 mr-2" />
               Listado de clientes
            </Link>
          </Button>
        </div>
        
        {/* Información adicional */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-blue-900 mb-1">Información importante</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Asegúrese de agregar al menos un dispositivo para el cliente</li>
                <li>• El número de serie debe ser único para cada dispositivo</li>
                <li>• Puede agregar múltiples dispositivos del mismo tipo</li>
                <li>• La información del cliente se utilizará para generar órdenes de servicio</li>
              </ul>
            </div>
          </div>
        </div>
        
        <ClienteForm />
      </div>
    </div>
  );
}