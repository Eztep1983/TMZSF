import { StatCard } from "@/components/dashboard/StatCard";
import { LatestOrdersTable } from "@/components/dashboard/LatestOrdersTable";
import { Wrench, CheckCircle, DollarSign, Clock } from "lucide-react";
import { mockOrders } from "@/lib/data";
import type { Orden } from "@/types";

export default function DashboardPage() {
  const openOrders = mockOrders.filter(
    (order: Orden) => order.status !== "Entregado"
  ).length;
  
  const deliveredThisMonth = mockOrders.filter((order: Orden) => {
    const orderDate = new Date(order.updatedAt);
    const now = new Date();
    return order.status === "Entregado" && orderDate.getMonth() === now.getMonth() && orderDate.getFullYear() === now.getFullYear();
  }).length;

  const estimatedProfits = mockOrders.reduce((total, order) => {
      const partsCost = order.parts.reduce((sum, part) => sum + (part.price * part.quantity), 0);
      return total + (order.estimatedBudget ?? partsCost); 
  }, 0);

  const latestOrders = [...mockOrders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Panel de Control</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Órdenes Abiertas" value={String(openOrders)} Icon={Wrench} />
        <StatCard title="Entregadas este Mes" value={String(deliveredThisMonth)} Icon={CheckCircle} />
        <StatCard title="Ganancias Estimadas" value={`$${estimatedProfits.toFixed(2)}`} Icon={DollarSign} />
        <StatCard title="En Diagnóstico" value={String(mockOrders.filter(o => o.status === 'En diagnóstico').length)} Icon={Clock} />
      </div>
      <div>
        <LatestOrdersTable orders={latestOrders} />
      </div>
    </div>
  );
}
