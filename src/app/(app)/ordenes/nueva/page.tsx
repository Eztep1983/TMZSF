import { OrderForm } from "@/components/orders/OrderForm";

export default function NewOrderPage() {
  return (
    <div className="flex flex-col gap-6">
       <h1 className="text-3xl font-bold font-headline">Crear Orden de Servicio</h1>
      <OrderForm />
    </div>
  );
}
