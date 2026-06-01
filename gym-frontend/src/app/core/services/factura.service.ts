import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Factura, TipoFactura } from '../models/models';

@Injectable({ providedIn: 'root' })
export class FacturaService {
  private url = `${environment.apiUrl}/facturas`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Factura[]> {
    return this.http.get<Factura[]>(this.url);
  }

  getById(id: number): Observable<Factura> {
    return this.http.get<Factura>(`${this.url}/${id}`);
  }

  getByCliente(cc: number): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.url}/cliente/${cc}`);
  }

  getByTipo(tipo: TipoFactura): Observable<Factura[]> {
    return this.http.get<Factura[]>(`${this.url}/tipo/${tipo}`);
  }

  create(factura: Factura): Observable<Factura> {
    const payload = this.formatearFechas(factura);
    return this.http.post<Factura>(this.url, payload);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  // Convierte objetos Date del datepicker a string yyyy-MM-dd
  private formatearFechas(factura: any): any {
    const payload = { ...factura };
    if (payload.fechaInicio instanceof Date) {
      payload.fechaInicio = this.toISODate(payload.fechaInicio);
    }
    if (payload.fechaFin instanceof Date) {
      payload.fechaFin = this.toISODate(payload.fechaFin);
    }
    if (payload.fechaFactura instanceof Date) {
      payload.fechaFactura = this.toISODate(payload.fechaFactura);
    }
    return payload;
  }

  private toISODate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
