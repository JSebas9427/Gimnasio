import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReporteResumenDTO {
  totalIngresos: number;
  totalMensualidades: number;
  totalDiarios: number;
  cantidadFacturas: number;
  cantidadMensualidades: number;
  cantidadDiarios: number;
  clientesNuevos: number;
  totalEfectivo: number;
  totalTarjeta: number;
  totalTransferencia: number;
  totalNequi: number;
}

export interface ReporteIngresoDTO {
  idFactura: number;
  fechaFactura: string;
  tipo: string;
  metodoPago: string;
  valor: number;
  clienteCc: number | null;
  clienteNombre: string | null;
  vendedorCc: number;
  vendedorNombre: string;
  planNombre: string | null;
}

export interface ReporteIngresoDiaDTO {
  fecha: string;
  totalDia: number;
  cantidadFacturas: number;
}

export interface ReporteClienteNuevoDTO {
  cc: number;
  nombreCompleto: string;
  telefono: string;
  correo: string;
  fechaRegistro: string;
  planNombre: string | null;
}

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private url = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  private params(inicio: string, fin: string): HttpParams {
    return new HttpParams().set('inicio', inicio).set('fin', fin);
  }

  getResumen(inicio: string, fin: string): Observable<ReporteResumenDTO> {
    return this.http.get<ReporteResumenDTO>(`${this.url}/resumen`, { params: this.params(inicio, fin) });
  }

  getIngresos(inicio: string, fin: string): Observable<ReporteIngresoDTO[]> {
    return this.http.get<ReporteIngresoDTO[]>(`${this.url}/ingresos`, { params: this.params(inicio, fin) });
  }

  getIngresosPorDia(inicio: string, fin: string): Observable<ReporteIngresoDiaDTO[]> {
    return this.http.get<ReporteIngresoDiaDTO[]>(`${this.url}/ingresos-por-dia`, { params: this.params(inicio, fin) });
  }

  getClientesNuevos(inicio: string, fin: string): Observable<ReporteClienteNuevoDTO[]> {
    return this.http.get<ReporteClienteNuevoDTO[]>(`${this.url}/clientes-nuevos`, { params: this.params(inicio, fin) });
  }
}
