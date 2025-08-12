import { RepuestoForm } from "@/components/inventario/RepuestoForm";
import { mockRepuestos } from "@/lib/data";

async function getRepuesto(id: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockRepuestos.find((item) => item.id === id) || null;
}

export default async function EditarRepuestoPage({ params }: { params: { id: string } }) {
  const repuesto = await getRepuesto(params.id);

  if (!repuesto) {
    return <div>Repuesto no encontrado.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Editar Repuesto: {repuesto.name}</h1>
      <RepuestoForm initialData={repuesto} />
    </div>
  );
}
