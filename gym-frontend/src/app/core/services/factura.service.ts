import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura, TipoFactura } from '../models/models';

export interface DetalleDTO {
  idDetalleFactura?: number;
  descripcion?: string;
  valorEsperado?: number;
  valorPagado: number;
}

export interface FacturaDTO {
  idFactura?: number;
  tipo: TipoFactura;
  metodoPago?: string;
  fechaFactura?: string;
  fechaInicio?: string;
  fechaFin?: string;
  cliente?: { cc: number; nombre1?: string; apellido1?: string } | null;
  vendedor?: { cc: number; nombre1?: string; apellido1?: string };
  plan?: { idPlan: number; nombre?: string; precio?: number } | null;
  detalles: DetalleDTO[];
}

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private url = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(this.url);
  }

  buscar(q: string, mes: number, anio: number): Observable<FacturaDTO[]> {
    let params = new HttpParams();
    if (q)    params = params.set('q', q);
    if (mes)  params = params.set('mes', mes.toString());
    if (anio) params = params.set('anio', anio.toString());
    return this.http.get<FacturaDTO[]>(`${this.url}/buscar`, { params });
  }

  getById(id: number): Observable<FacturaDTO> {
    return this.http.get<FacturaDTO>(`${this.url}/${id}`);
  }

  getByCliente(cc: number): Observable<FacturaDTO[]> {
    return this.http.get<FacturaDTO[]>(`${this.url}/cliente/${cc}`);
  }

  create(factura: any): Observable<FacturaDTO> {
    return this.http.post<FacturaDTO>(this.url, factura);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
