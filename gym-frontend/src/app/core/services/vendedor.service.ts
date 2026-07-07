import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vendedor } from '../models/models';

export interface VendedorPerfilDTO {
  cc: number;
  nombre1: string;
  nombre2: string;
  apellido1: string;
  apellido2: string;
  nombreCompleto: string;
  cargo: string;
  telefono: string;
  correo: string;
  totalFacturas: number;
  totalMensualidades: number;
  totalDiarios: number;
  totalIngresos: number;
  facturas: any[];
}

export type PeriodoVendedor = 'todas' | 'hoy' | 'semana' | 'mes' | 'anio';

@Injectable({ providedIn: 'root' })
export class VendedorService {
  private url = `${environment.apiUrl}/vendedores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.url);
  }

  buscar(q: string): Observable<Vendedor[]> {
    const params = q ? new HttpParams().set('q', q) : new HttpParams();
    return this.http.get<Vendedor[]>(`${this.url}/buscar`, { params });
  }

  getPerfil(cc: number, periodo: PeriodoVendedor = 'todas'): Observable<VendedorPerfilDTO> {
    const params = new HttpParams().set('periodo', periodo);
    return this.http.get<VendedorPerfilDTO>(`${this.url}/${cc}/perfil`, { params });
  }

  getById(cc: number): Observable<Vendedor> {
    return this.http.get<Vendedor>(`${this.url}/${cc}`);
  }

  create(vendedor: Vendedor): Observable<Vendedor> {
    return this.http.post<Vendedor>(this.url, vendedor);
  }

  update(cc: number, vendedor: Vendedor): Observable<Vendedor> {
    return this.http.put<Vendedor>(`${this.url}/${cc}`, vendedor);
  }

  delete(cc: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${cc}`);
  }
}
