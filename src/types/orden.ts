// types/orden.ts
export interface Cliente {
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface Dispositivo {
  tipo: string;
  marca: string;
  modelo: string;
  numeroSerie: string;
}

export interface OrdenBase {
  id: string;
  cliente: Cliente;
  dispositivo: Dispositivo;
  fechaCreacion: Date;
  estado: 'pendiente' | 'en_proceso' | 'completada' | 'cancelada';
}

export interface OrdenGarantia extends OrdenBase {
  tipo: 'garantia';
  fechaCompra: Date;
  descripcionProblema: string;
  evidencia?: string[];
  tiempoGarantia: number; // en meses
  condicionesGarantia: string;
}

export interface OrdenMantenimiento extends OrdenBase {
  tipo: 'mantenimiento';
  tipoMantenimiento: 'preventivo' | 'correctivo';
  tareasRealizadas: string[];
  piezasUsadas?: Array<{
    pieza: string;
    cantidad: number;
    precio?: number;
  }>;
  estadoAntes?: string[];
  estadoDespues?: string[];
  garantiaTiempo: number; // en meses
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