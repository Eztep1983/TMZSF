import { ClienteForm } from "@/components/clientes/ClienteForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import Link from "next/link";

async function getCliente(id: string) {
  const docRef = doc(db, "clientes", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }

  return {
    id: docSnap.id,
    ...docSnap.data()
  } as Cliente;
}

export default async function ClienteDetailPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const client = await getCliente(params.id);

  if (!client) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Cliente no encontrado</h2>
        <Button asChild className="mt-4">
          <Link href="/clientes">Volver al listado</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Editar Cliente: {client.name}</h1>
        <Button asChild variant="outline">
          <Link href={`/clientes/${params.id}`}>Modo Visualización</Link>
        </Button>
      </div>
      
      <ClienteForm initialData={client} />
    </div>
  );
}