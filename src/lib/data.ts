import type { Orden, Cliente, RepuestoInventario } from "@/types";

export const mockClients: Cliente[] = [
  { id: "C1", name: "Juan Pérez", email: "juan.perez@example.com", phone: "123-456-7890", address: "Calle Falsa 123" },
  { id: "C2", name: "Ana García", email: "ana.garcia@example.com", phone: "234-567-8901", address: "Av. Siempreviva 742" },
  { id: "C3", name: "Pedro Rodríguez", email: "pedro.rodriguez@example.com", phone: "345-678-9012", address: "Plaza Mayor 1" },
];

export const mockOrders: Orden[] = [
  {
    id: "ORD001",
    client: mockClients[0],
    deviceType: "Laptop",
    problemDescription: "La pantalla está rota y no enciende.",
    status: "En diagnóstico",
    parts: [],
    createdAt: new Date("2023-10-26T10:00:00Z"),
    updatedAt: new Date("2023-10-26T12:30:00Z"),
    estimatedBudget: 150,
  },
  {
    id: "ORD002",
    client: mockClients[1],
    deviceType: "Teléfono",
    problemDescription: "La batería se agota muy rápido.",
    status: "En reparación",
    parts: [{ id: "p1", name: "Batería iPhone 12", quantity: 1, price: 49.99 }],
    createdAt: new Date("2023-10-25T14:00:00Z"),
    updatedAt: new Date("2023-10-26T09:00:00Z"),
    estimatedBudget: 75,
  },
  {
    id: "ORD003",
    client: mockClients[2],
    deviceType: "Tablet",
    problemDescription: "El puerto de carga está suelto.",
    status: "Listo para entrega",
    parts: [],
    createdAt: new Date("2023-10-24T11:00:00Z"),
    updatedAt: new Date("2023-10-25T17:00:00Z"),
    estimatedBudget: 50,
  },
  {
    id: "ORD004",
    client: mockClients[0],
    deviceType: "Teléfono",
    problemDescription: "El dispositivo no se conecta a Wi-Fi.",
    status: "Entregado",
    parts: [],
    createdAt: new Date("2023-09-15T09:00:00Z"),
    updatedAt: new Date("2023-09-18T16:00:00Z"),
    estimatedBudget: 40,
  },
    {
    id: "ORD005",
    client: mockClients[2],
    deviceType: "Laptop",
    problemDescription: "El sistema funciona muy lento, posible virus.",
    status: "Recibido",
    parts: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const mockRepuestos: RepuestoInventario[] = [
    { id: "INV001", name: "Pantalla iPhone 14", description: "Pantalla OLED de reemplazo para iPhone 14", price: 250, stock: 10 },
    { id: "INV002", name: "Batería Samsung S22", description: "Batería de litio para Samsung Galaxy S22", price: 80, stock: 15 },
    { id: "INV003", name: "Disco SSD 512GB", description: "Disco de estado sólido NVMe M.2 de 512GB", price: 60, stock: 8 },
    { id: "INV004", name: "Memoria RAM 8GB DDR4", description: "Módulo de memoria RAM SODIMM para laptop", price: 45, stock: 20 },
    { id: "INV005", name: "Puerto de carga USB-C", description: "Componente de puerto de carga USB-C para tablets", price: 25, stock: 30 },
]
