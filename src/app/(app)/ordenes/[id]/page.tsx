import { OrderForm } from "@/components/orders/OrderForm";
import { mockOrders } from "@/lib/data";

// This is a server component, so we can fetch data here.
// In a real app, you would fetch this from your database.
async function getOrder(id: string) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return mockOrders.find((order) => order.id === id) || null;
}

export default async function EditOrderPage({ params }: { params: { id: string } }) {
  const order = await getOrder(params.id);

  if (!order) {
    return <div>Orden no encontrada.</div>;
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold font-headline">Editar Orden de Servicio: {order.id}</h1>
      <OrderForm initialData={order} />
    </div>
  );
}
