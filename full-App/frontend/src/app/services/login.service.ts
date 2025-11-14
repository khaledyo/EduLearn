import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { API_CONFIG } from '../core/api-config';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly apiUrl = `${this.baseUrl}/login`;

  private authStatus = new BehaviorSubject<boolean>(this.isLoggedIn());

  constructor(private http: HttpClient) {
    // ✅ Nettoyage automatique des tokens invalides/expirés au démarrage
    this.clearInvalidToken();
  }

  // ======================== LOGIN ========================
  loginUser(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(this.apiUrl, credentials, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      })
    });
  }

  // ======================== SAUVEGARDE ========================
  setUserData(user: any) {
    const normalizedUser = this.normalizeUser(user);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    if (normalizedUser?.token) {
      localStorage.setItem('token', normalizedUser.token);
    }
    if (normalizedUser?.id) {
      localStorage.setItem('userId', String(normalizedUser.id));
    }
    if (normalizedUser?.role) {
      localStorage.setItem('userRole', normalizedUser.role);
    }
    this.authStatus.next(true);
    console.log('✅ User data saved:', normalizedUser);
  }

  // ======================== RÉCUPÉRATION ========================
  getUserData() {
    const userData = localStorage.getItem('user');
    if (!userData) {
      return null;
    }

    try {
      const parsed = JSON.parse(userData);
      return this.normalizeUser(parsed);
    } catch (error) {
      console.error('Erreur lors du parsing des données utilisateur:', error);
      return null;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // ======================== DÉCONNEXION ========================
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
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
    return user?.role || localStorage.getItem('userRole') || null;
  }

  getUserId(): number | null {
    const user = this.getUserData();
    const id = user?.id ?? localStorage.getItem('userId');
    return id !== null && id !== undefined ? Number(id) : null;
  }

  // ======================== NETTOYAGE TOKEN INVALIDES ========================
  clearInvalidToken() {
    const userData = this.getUserData();
    if (userData && userData.token) {
      const token = userData.token;
      // Les tokens Laravel Sanctum ne sont pas des JWT -> ignorer l'expiration automatique
      if (token.includes('.')) {
      try {
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

  private normalizeUser(user: any): any {
    if (!user) {
      return user;
    }

    const normalized = { ...user };

    if (!normalized.role && normalized?.user?.role) {
      normalized.role = normalized.user.role;
    }

    if (!normalized.id && normalized?.user?.id) {
      normalized.id = normalized.user.id;
    }

    if (!normalized.email && normalized?.user?.email) {
      normalized.email = normalized.user.email;
    }

    // Normalisation des noms à partir de "name"
    if (!normalized.prenom || !normalized.nom) {
      const nameSource = normalized.name ?? normalized.fullName ?? '';
      if (typeof nameSource === 'string' && nameSource.trim().length > 0) {
        const parts = nameSource.trim().split(/\s+/);
        if (!normalized.prenom) {
          normalized.prenom = parts[0];
        }
        if (!normalized.nom) {
          normalized.nom = parts.length > 1 ? parts.slice(1).join(' ') : '';
        }
      }
    }

    return normalized;
  }
}
