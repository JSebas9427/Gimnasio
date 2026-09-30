import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetodoPago } from '../models/models';

@Injectable({ providedIn: 'root' })
export class MetodoPagoService {
  private url = `${environment.apiUrl}/metodos-pago`;

  constructor(private http: HttpClient) {}

  getAll(soloActivos = false): Observable<MetodoPago[]> {
    const params = new HttpParams().set('soloActivos', soloActivos);
    return this.http.get<MetodoPago[]>(this.url, { params });
  }

  getActivos(): Observable<MetodoPago[]> {
    return this.getAll(true);
  }

  getById(id: number): Observable<MetodoPago> {
    return this.http.get<MetodoPago>(`${this.url}/${id}`);
  }

  create(metodo: MetodoPago): Observable<MetodoPago> {
    return this.http.post<MetodoPago>(this.url, metodo);
  }

  update(id: number, metodo: MetodoPago): Observable<MetodoPago> {
    return this.http.put<MetodoPago>(`${this.url}/${id}`, metodo);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
