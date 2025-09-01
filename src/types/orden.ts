// types/orden.ts
export interface Dispositivo {
  id: string;
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
  fechaCompra?: Date;
  observaciones?: string;
}

export interface Cliente {
  id: string;
  name: string;
  cedula: string; 
  email: string;
  phone: string; 
  address?: string; 
  dispositivos: Dispositivo[]; 
  createdAt?: string;
  updatedAt?: string;
}

export interface OrdenBase {
  id: string;
  cliente: Cliente;
  dispositivo: Dispositivo;
  fechaCreacion: Date;
}

export interface OrdenGarantia extends OrdenBase {
  tipo: 'garantia';
  fechaCompra: Date;
  descripcionProblema: string;
  evidencia?: string[];
  tiempoGarantia: number; // en meses
  condicionesGarantia: string;
}

// types/orden.ts
export interface OrdenMantenimiento {
  id: string; 
  idPersonalizado: string; 
  tipo: 'mantenimiento';
  cliente: Cliente;
  dispositivo: Dispositivo;
  fechaCreacion: Date;
  horaCreacion: string; 
  tipoMantenimiento: 'preventivo' | 'correctivo';
  tareasRealizadas: string[];
  piezasUsadas?: Array<{pieza: string, cantidad: number}>;
  estadoAntes: string[];
  estadoDespues: string[];
  garantiaTiempo: number;
  garantiaDescripcion: string;
}

export interface OrdenDiagnostico extends OrdenBase {
  tipo: 'diagnostico';
  observacionesIniciales: string;
  pruebasRealizadas: string;
  posiblesCausas: string;
  contadorMaquina?: number;
  fechaCompra?: Date;
  diagnosticoFinal: string;
  recomendaciones: string;
}

export interface OrdenEntrega extends OrdenBase {
  tipo: 'entrega';
  fechaEntrega: Date;
  observacionesFinales: string;
  firmaCliente: string;
  validacionCliente: boolean;
  reparacionesRealizadas?: string;
  repuestosUtilizados?: string;
  documentosEntregados?: string;
  contadorFinal?: number;
  garantiaReparacion?: number;
}

export type Orden = OrdenGarantia | OrdenMantenimiento | OrdenDiagnostico | OrdenEntrega;