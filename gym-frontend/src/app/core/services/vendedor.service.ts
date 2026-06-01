import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Vendedor } from '../models/models';

@Injectable({ providedIn: 'root' })
export class VendedorService {
  private url = `${environment.apiUrl}/vendedores`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Vendedor[]> {
    return this.http.get<Vendedor[]>(this.url);
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
