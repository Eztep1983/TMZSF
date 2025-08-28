import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Cliente, Dispositivo } from "@/types/orden";
import { Edit, Mail, Phone, MapPin, Monitor, Calendar, FileText, Plus } from "lucide-react";

async function getCliente(id: string) {
  const docRef = doc(db, "clientes", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  const data = docSnap.data();
  
  // Asegurar que dispositivos siempre sea un array
  const dispositivos: Dispositivo[] = data.dispositivos || [];
  
  // Migrar datos antiguos si existen
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
    name: data.name || data.nombre || '',
    email: data.email || '',
    phone: data.phone || data.telefono || '',
    address: data.address || data.direccion || '',
    observations: data.observations || data.observaciones || '',
    dispositivos,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  } as Cliente;
}

export default async function ClienteViewPage({ 
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
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{client.name}</h1>
            <p className="text-gray-600 mt-1">Información del cliente</p>
          </div>
          <div className="flex space-x-3">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información del Cliente */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Datos de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{client.email || 'No especificado'}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{client.phone || 'No especificado'}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <span className="text-sm">{client.address || 'No especificada'}</span>
                </div>
                
                {/* Fechas */}
                <div className="border-t pt-4 mt-4">
                  {client.createdAt && (
                    <div className="flex items-center space-x-3 mb-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Registrado</div>
                        <div className="text-sm">{new Date(client.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                  {client.updatedAt && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-xs text-gray-500">Última actualización</div>
                        <div className="text-sm">{new Date(client.updatedAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Observaciones */}
            {client.observations && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Observaciones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700">{client.observations}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Dispositivos */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Monitor className="w-5 h-5 mr-2" />
                    Dispositivos ({client.dispositivos?.length || 0})
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/clientes/${params.id}/editar`}>
                      <Plus className="w-4 h-4 mr-1" />
                      Agregar 
                    </Link>
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {client.dispositivos && client.dispositivos.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {client.dispositivos.map((dispositivo, index) => (
                      <div key={dispositivo.id || index} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center">
                            <Monitor className="w-4 h-4 text-blue-500 mr-2" />
                            <span className="font-medium text-sm capitalize">{dispositivo.tipo}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Marca/Modelo:</span>
                            <span className="ml-2 font-medium">{dispositivo.marca} {dispositivo.modelo}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Serie:</span>
                            <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                              {dispositivo.numeroSerie}
                            </span>
                          </div>
                          {dispositivo.fechaCompra && (
                            <div>
                              <span className="text-gray-500">Compra:</span>
                              <span className="ml-2">{new Date(dispositivo.fechaCompra).toLocaleDateString()}</span>
                            </div>
                          )}
                          {dispositivo.observaciones && (
                            <div className="pt-2 border-t">
                              <span className="text-gray-500 text-xs">Observaciones:</span>
                              <p className="text-xs text-gray-600 mt-1">{dispositivo.observaciones}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No hay dispositivos registrados</p>
                    <Button asChild variant="outline">
                      <Link href={`/clientes/${params.id}/editar`}>
                        <Plus className="w-4 h-4 mr-1" />
                        Agregar primer dispositivo
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}