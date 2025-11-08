import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private apiUrl = 'http://localhost:3000/api/login';

  private authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient) {
    // ✅ Nettoyage automatique des tokens invalides/expirés au démarrage
    this.clearInvalidToken();
  }

  // ======================== LOGIN ========================
  loginUser(credentials: { email: string; motDePasse: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials);
  }

  // ======================== SAUVEGARDE ========================
  setUserData(user: any) {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token); // ✅ pour accès direct au token
    this.authStatus.next(true);
    console.log('✅ User data saved:', user);
  }

  // ======================== RÉCUPÉRATION ========================
  getUserData() {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ======================== DÉCONNEXION ========================
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.authStatus.next(false);
    console.log('🚪 User logged out');
  }

  // ======================== ÉTAT DE CONNEXION ========================
  isLoggedIn(): boolean {
    const user = this.getUserData();
    const token = user?.token || localStorage.getItem('token');
    return !!token;
  }

  getAuthStatus() {
    return this.authStatus.asObservable();
  }

  getUserRole(): string | null {
    const user = this.getUserData();
    return user?.role || null;
  }

  // ======================== NETTOYAGE TOKEN INVALIDES ========================
  clearInvalidToken() {
    const userData = this.getUserData();
    if (userData && userData.token) {
      try {
        const token = userData.token;
        const payload = JSON.parse(atob(token.split('.')[1]));
        const now = Math.floor(Date.now() / 1000);

        if (payload.exp && payload.exp < now) {
          console.warn('⚠️ Token expiré supprimé.');
          this.logout();
        }
      } catch (e) {
        console.warn('⚠️ Token invalide supprimé.');
        this.logout();
      }
    }
  }
}
