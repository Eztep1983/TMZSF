export type TipoOrden =
  | "Garantía"
  | "Mantenimiento"
  | "Diagnóstico"
  | "Entrega";

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
}

export interface RepuestoInventario {
    id: string;
    name:string;
    description: string;
    stock: number;
}

export interface Orden {
  id: string;
  type: TipoOrden; // Nuevo campo
  client: Cliente;
  deviceType: "Fotocopiadora" | "Impresora" | "Escaner" | "Otro";
  problemDescription: string;
  status: EstadoOrden;
  parts: RepuestoEnOrden[];
  createdAt: Date;
  updatedAt: Date;
  assignedTechnician?: string;
}