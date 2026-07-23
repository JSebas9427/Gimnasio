import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardResumenDTO {
  ingresosHoy: number;
  facturasHoy: number;
  ingresosSemana: number;
  totalClientes: number;
  clientesActivos: number;
  clientesAgotados: number;
  clientesSinPlan: number;
  clientesVencenHoy: number;
  clientesVencen3Dias: number;
  clientesVencen7Dias: number;
}

export interface EstadoMembresiasDTO {
  activos: number;
  agotados: number;
  sinPlan: number;
  total: number;
  porcentajeActivos: number;
  porcentajeAgotados: number;
  porcentajeSinPlan: number;
}

export interface ClienteProximoVencerDTO {
  cc: number;
  nombreCompleto: string;
  telefono: string;
  planNombre: string;
  fechaFin: string;
  diasRestantes: number;
}

export interface ClienteBusquedaRapidaDTO {
  cc: number;
  nombreCompleto: string;
  telefono: string;
  tipoPersona: 'CLIENTE' | 'EMPLEADO';
  // Cliente
  estado?: 'ACTIVO' | 'AGOTADO' | 'SIN_PLAN';
  planNombre?: string;
  fechaInicio?: string;
  fechaFin?: string;
  diasRestantes?: number;
  // Empleado
  cargo?: string;
  // Resultado
  accesoPermitido: boolean;
  motivoDenegacion?: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getResumen(): Observable<DashboardResumenDTO> {
    return this.http.get<DashboardResumenDTO>(`${this.url}/resumen`);
  }

  getEstadoMembresias(): Observable<EstadoMembresiasDTO> {
    return this.http.get<EstadoMembresiasDTO>(`${this.url}/estado-membresias`);
  }

  getProximosAVencer(dias: number = 7): Observable<ClienteProximoVencerDTO[]> {
    return this.http.get<ClienteProximoVencerDTO[]>(
      `${this.url}/proximos-a-vencer`,
      { params: new HttpParams().set('dias', dias) }
    );
  }

  buscarClienteIngreso(cc: number): Observable<ClienteBusquedaRapidaDTO> {
    return this.http.get<ClienteBusquedaRapidaDTO>(
      `${this.url}/cliente-ingreso`,
      { params: new HttpParams().set('cc', cc) }
    );
  }
}
