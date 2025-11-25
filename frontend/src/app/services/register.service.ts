import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../core/api-config';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) {}

  register(userData: { name: string; email: string; password: string; password_confirmation: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, userData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
  }
}