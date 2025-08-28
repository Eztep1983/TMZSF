"use client";
import { useState, useEffect } from "react";
import { ClientesDataTable } from "./ClientesDataTable";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { Cliente } from "@/types/orden";

export function ClientesList() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const q = query(collection(db, "clientes"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        const clientesData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name || "",
          email: doc.data().email || "",
          phone: doc.data().phone || "",
          address: doc.data().address || "",
          observations: doc.data().observations || "",
          dispositivos: doc.data().dispositivos || [],
        }));
        
        setClientes(clientesData);
      } catch (error) {
        console.error("Error al obtener clientes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Clientes</h1>
        <Button asChild>
          <Link href="/clientes/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Cliente
          </Link>
        </Button>
      </div>
      <ClientesDataTable data={clientes} />
    </div>
  );
}