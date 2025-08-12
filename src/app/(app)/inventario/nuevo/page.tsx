import { RepuestoForm } from "@/components/inventario/RepuestoForm";

export default function NuevoRepuestoPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Agregar Nuevo Repuesto</h1>
      <RepuestoForm />
    </div>
  );
}
