import { ClienteForm } from "@/components/clientes/ClienteForm";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";


async function getCliente(id: string) {
  const docRef = doc(db, "clientes", id);
  const docSnap = await getDoc(docRef);
  
  if (!docSnap.exists()) {
    return null;
  }
  

  return {
    id: docSnap.id,
    name: docSnap.data().name || "",
    email: docSnap.data().email || "",
    phone: docSnap.data().phone || "",
    address: docSnap.data().address || "",
    observations: docSnap.data().observations || "",
  };
}

export default async function EditarClientePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const client = await getCliente(params.id);

  if (!client) {
    return notFound();
  }

  if (!client) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-[300px]" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Editar Cliente: {client.name}</h1>
      <ClienteForm initialData={client} />
    </div>
  );
}