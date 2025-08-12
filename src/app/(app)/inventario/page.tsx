import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InventarioDataTable } from "@/components/inventario/InventarioDataTable";
import { mockRepuestos } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function InventarioPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Inventario de Repuestos</h1>
        <Button asChild>
          <Link href="/inventario/nuevo">
            <PlusCircle className="mr-2 h-4 w-4" />
            Agregar Repuesto
          </Link>
        </Button>
      </div>
      <InventarioDataTable data={mockRepuestos} />
    </div>
  );
}
