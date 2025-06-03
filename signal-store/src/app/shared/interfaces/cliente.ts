export interface Cliente {
    username: string;
    total_pagado: number;
    cantidad_compras: number;
    fecha_ultima_evaluacion_vip?: string;
    dias_restantes_vip?: number;
}
  