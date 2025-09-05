"use client";
import { useState, useEffect } from "react";
import { ClientesDataTable } from "./ClientesDataTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, User, Loader2 } from "lucide-react";
import { Cliente } from "@/types/orden";
import { useAuth } from "@/components/auth/AuthProvider";

// IMPORTAR LOS HELPERS MULTI-USUARIO
import { getClientesPorUsuario } from '@/lib/multiuser-helpers'

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // OBTENER USUARIO AUTENTICADO

  useEffect(() => {
    const fetchClientes = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // USAR EL HELPER MULTI-USUARIO PARA OBTENER CLIENTES DEL USUARIO ACTUAL
        const clientesData = await getClientesPorUsuario(user.uid);
        
        setClientes(clientesData);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
        setError("No se pudieron cargar los clientes. Intente nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, [user?.uid]); // DEPENDER DEL UID DEL USUARIO

  // VERIFICAR QUE EL USUARIO ESTÉ AUTENTICADO
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">Debes iniciar sesión para ver los clientes.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Cargando clientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">{error}</p>
          <Button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <User className="w-8 h-8 text-blue-400" />
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Clientes</h1>
                <p className="text-gray-400 text-sm">
                  {clientes.length} {clientes.length === 1 ? 'cliente' : 'clientes'} registrados
                </p>
              </div>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 transition-colors">
              <Link href="/clientes/nuevo">
                <PlusCircle className="mr-2 h-4 w-4" />
                Agregar Cliente
              </Link>
            </Button>
          </div>
          
          {clientes.length === 0 ? (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8 text-center">
              <User className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No hay clientes registrados</h3>
              <p className="text-gray-500 mb-4">Comienza agregando tu primer cliente para gestionar sus dispositivos y órdenes de mantenimiento.</p>
              <Button asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/clientes/nuevo">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Crear primer cliente
                </Link>
              </Button>
            </div>
          ) : (
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
              <ClientesDataTable data={clientes} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}