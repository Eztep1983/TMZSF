import { ClienteForm } from "@/components/clientes/ClienteForm";
import { mockClients } from "@/lib/data";

async function getCliente(id: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockClients.find((client) => client.id === id) || null;
}

export default async function EditarClientePage({ params }: { params: { id: string } }) {
  const client = await getCliente(params.id);

  if (!client) {
    return <div>Cliente no encontrado.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Editar Cliente: {client.name}</h1>
      <ClienteForm initialData={client} />
    </div>
  );
}
