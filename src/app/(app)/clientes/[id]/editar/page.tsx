import { ClienteForm } from "@/components/clientes/ClienteForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Cliente, Dispositivo } from "@/types/orden";

async function getCliente(id: string) {
  const docRef = doc(db, "clientes", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  
  // Asegurar que dispositivos siempre sea un array
  const dispositivos: Dispositivo[] = data.dispositivos || [];
  
  // Migrar datos antiguos si existen (compatibilidad hacia atrás)
  if (!data.dispositivos && data.equipo) {
    dispositivos.push({
      id: `legacy-${Date.now()}`,
      tipo: data.equipo || 'otro',
      marca: 'No especificada',
      modelo: 'No especificado',
      numeroSerie: 'No especificado',
    });
  }

  return {
    id: docSnap.id,
    name: data.name || data.nombre || '', // Compatibilidad con nombres antiguos
    email: data.email || '',
    phone: data.phone || data.telefono || '', // Compatibilidad con nombres antiguos
    address: data.address || data.direccion || '', // Compatibilidad con nombres antiguos
    observations: data.observations || data.observaciones || '',
    dispositivos,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Cliente;
}

export default async function ClienteEditPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const client = await getCliente(params.id);

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12 bg-white rounded-lg shadow-sm max-w-md mx-auto">
          <div className="mb-4">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cliente no encontrado</h2>
          <p className="text-gray-600 mb-6">El cliente que buscas no existe o ha sido eliminado.</p>
          <Button asChild>
            <Link href="/clientes">Volver al listado</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Editar Cliente</h1>
            <p className="text-gray-600 mt-1">{client.name}</p>
          </div>
          <div className="flex space-x-3">
            <Button asChild variant="outline">
              <Link href={`/clientes/${params.id}`}>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver Cliente
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/clientes">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Listado
              </Link>
            </Button>
          </div>
        </div>
        
        {/* Información adicional */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Dispositivos registrados: {client.dispositivos?.length || 0}</span>
            <div className="flex space-x-4">
              {client.createdAt && (
                <span>Creado: {new Date(client.createdAt).toLocaleDateString()}</span>
              )}
              {client.updatedAt && (
                <span>Actualizado: {new Date(client.updatedAt).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        </div>
        
        <ClienteForm initialData={client} />
      </div>
    </div>
  );
}