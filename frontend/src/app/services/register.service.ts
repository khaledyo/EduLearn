import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RegisterService {
  private apiUrl = 'http://localhost:3000/api/register';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
  return this.http.post(`${this.apiUrl}/register`, userData);
}

}