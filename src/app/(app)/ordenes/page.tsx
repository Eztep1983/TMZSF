import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrdersDataTable } from "@/components/orders/OrdersDataTable";
import { mockOrders } from "@/lib/data";
import { PlusCircle } from "lucide-react";

export default function OrdersPage() {
  const sortedOrders = [...mockOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Órdenes de Servicio</h1>
        <Button asChild>
          <Link href="/ordenes/nueva">
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Orden
          </Link>
        </Button>
      </div>
      <OrdersDataTable data={sortedOrders} />
    </div>
  );
}
