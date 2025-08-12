import { ClienteForm } from "@/components/clientes/ClienteForm";

export default function NuevoClientePage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Agregar Nuevo Cliente</h1>
      <ClienteForm />
    </div>
  );
}
