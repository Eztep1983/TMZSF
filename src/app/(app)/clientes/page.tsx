import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ClientesDataTable } from "@/components/clientes/ClientesDataTable";
import { mockClients } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function ClientesPage() {
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
      <ClientesDataTable data={mockClients} />
    </div>
  );
}
