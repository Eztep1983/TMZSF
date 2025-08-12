export type EstadoOrden =
  | "Recibido"
  | "En diagnóstico"
  | "En reparación"
  | "Listo para entrega"
  | "Entregado";

export interface Cliente {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  observations?: string;
}

export interface RepuestoEnOrden {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

export interface RepuestoInventario {
    id: string;
    name:string;
    description: string;
    price: number;
    stock: number;
}

export interface Orden {
  id: string;
  client: Cliente;
  deviceType: "Laptop" | "Teléfono" | "Tablet" | "Otro";
  problemDescription: string;
  status: EstadoOrden;
  parts: RepuestoEnOrden[];
  createdAt: Date;
  updatedAt: Date;
  assignedTechnician?: string;
  estimatedBudget?: number;
}
