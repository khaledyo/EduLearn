import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Cours {
  id?: number;
  titre: string;
  description: string;
  support?: string | string[];
  dateCreation?: Date;
  enseignantId: number;
  enseignantNom?: string;
  enseignantPrenom?: string;
  duree?: number;
  niveau?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoursService {
  private apiUrl = 'http://localhost:3000/enseignant/cours';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || ''}`
    });
  }

  /**
   * Normalise les supports pour toujours retourner un tableau de strings
   */
  private normalizeSupports(support: string | string[] | undefined): string[] {
    if (!support) return [];
    
    if (Array.isArray(support)) {
      return support.filter(s => s && s.trim().length > 0);
    }
    
    if (typeof support === 'string') {
      return support.split(',')
        .map(s => s.trim())
        .filter(s => s.length > 0);
    }
    
    return [];
  }

  /**
   * Transforme les supports en string CSV pour l'API
   */
  private supportsToString(support: string | string[] | undefined): string {
    if (!support) return '';
    
    if (Array.isArray(support)) {
      return support.filter(s => s && s.trim().length > 0).join(',');
    }
    
    return support.toString();
  }

  /**
   * CREATE - Créer un nouveau cours
   */
  createCours(cours: Cours): Observable<Cours> {
    const coursToSend = {
      ...cours,
      support: this.supportsToString(cours.support),
      enseignantNom: cours.enseignantNom || this.getCurrentUserNom(),
      enseignantPrenom: cours.enseignantPrenom || this.getCurrentUserPrenom()
    };

    return this.http.post<Cours>(this.apiUrl, coursToSend, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => ({
        ...response,
        support: this.normalizeSupports(response.support)
      })),
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer tous les cours d'un enseignant
   */
  getCoursByEnseignant(enseignantId: number): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.apiUrl}/enseignant/${enseignantId}`, { 
      headers: this.getHeaders()
    }).pipe(
      map(coursList => 
        coursList.map(cours => ({
          ...cours,
          support: this.normalizeSupports(cours.support),
          enseignantNom: cours.enseignantNom || 'Enseignant',
          enseignantPrenom: cours.enseignantPrenom || 'Inconnu'
        }))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer tous les cours (pour étudiant)
   */
  getTousLesCours(): Observable<Cours[]> {
    return this.http.get<Cours[]>(this.apiUrl, { 
      headers: this.getHeaders() 
    }).pipe(
      map(coursList => 
        coursList.map(cours => ({
          ...cours,
          support: this.normalizeSupports(cours.support),
          enseignantNom: cours.enseignantNom || 'Enseignant',
          enseignantPrenom: cours.enseignantPrenom || 'Inconnu'
        }))
      ),
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer un cours par son ID
   */
  getCoursById(id: number): Observable<Cours> {
    return this.http.get<Cours>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      map(cours => ({
        ...cours,
        support: this.normalizeSupports(cours.support),
        enseignantNom: cours.enseignantNom || 'Enseignant',
        enseignantPrenom: cours.enseignantPrenom || 'Inconnu'
      })),
      catchError(this.handleError)
    );
  }

  /**
   * UPDATE - Mettre à jour un cours
   */
  updateCours(id: number, cours: Cours): Observable<Cours> {
    const coursToSend = {
      ...cours,
      support: this.supportsToString(cours.support)
    };

    return this.http.put<Cours>(`${this.apiUrl}/${id}`, coursToSend, { 
      headers: this.getHeaders() 
    }).pipe(
      map(response => ({
        ...response,
        support: this.normalizeSupports(response.support)
      })),
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Supprimer un cours
   */
  deleteCours(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`, { 
      headers: this.getHeaders() 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * GET - Nombre de cours d'un enseignant
   */
  getNombreCoursByEnseignant(enseignantId: number): Observable<number> {
    return this.getCoursByEnseignant(enseignantId).pipe(
      map(cours => cours.length),
      catchError(error => {
        console.error('Erreur lors du comptage des cours:', error);
        return of(0);
      })
    );
  }

  /**
   * GET - Cours récents (les 3 derniers)
   */
  getCoursRecents(enseignantId: number, limit: number = 3): Observable<Cours[]> {
    return this.getCoursByEnseignant(enseignantId).pipe(
      map(cours => 
        cours
          .sort((a, b) => new Date(b.dateCreation || 0).getTime() - new Date(a.dateCreation || 0).getTime())
          .slice(0, limit)
          .map(c => ({
            ...c,
            support: this.normalizeSupports(c.support)
          }))
      ),
      catchError(error => {
        console.error('Erreur lors de la récupération des cours récents:', error);
        return of([]);
      })
    );
  }

  /**
   * Upload de fichier
   */
  uploadFile(file: File): Observable<{ filePath: string; fileName: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
    });

    return this.http.post<{ filePath: string; fileName: string }>(
      `${this.apiUrl}/upload`, 
      formData, 
      { headers }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Rechercher des cours par terme
   */
  rechercherCours(enseignantId: number, searchTerm: string): Observable<Cours[]> {
    if (!searchTerm.trim()) {
      return this.getCoursByEnseignant(enseignantId);
    }

    const params = new HttpParams()
      .set('enseignantId', enseignantId.toString())
      .set('search', searchTerm.trim());

    return this.http.get<Cours[]>(`${this.apiUrl}/recherche`, { 
      headers: this.getHeaders(),
      params 
    }).pipe(
      map(coursList => 
        coursList.map(cours => ({
          ...cours,
          support: this.normalizeSupports(cours.support)
        }))
      ),
      catchError(error => {
        console.error('Erreur lors de la recherche:', error);
        return of([]);
      })
    );
  }

  /**
   * Vérifier si un cours existe
   */
  coursExiste(id: number): Observable<boolean> {
    return this.getCoursById(id).pipe(
      map(cours => !!cours),
      catchError(() => of(false))
    );
  }

  /**
   * Récupérer les cours disponibles pour les étudiants (avec pagination optionnelle)
   */
  getCoursDisponibles(page: number = 1, limit: number = 10): Observable<{ cours: Cours[]; total: number }> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get<{ cours: Cours[]; total: number }>(`${this.apiUrl}/disponibles`, {
      headers: this.getHeaders(),
      params
    }).pipe(
      map(response => ({
        ...response,
        cours: response.cours.map(cours => ({
          ...cours,
          support: this.normalizeSupports(cours.support)
        }))
      })),
      catchError(this.handleError)
    );
  }

  /**
   * Récupérer les informations de l'utilisateur courant
   */
  private getCurrentUserNom(): string {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.nom || 'Enseignant';
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    }
    return 'Enseignant';
  }

  private getCurrentUserPrenom(): string {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.prenom || 'Inconnu';
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    }
    return 'Inconnu';
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur dans CoursService:', error);
    
    let errorMessage = 'Une erreur est survenue lors de l\'opération';
    
    if (error.status === 0) {
      errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
    } else if (error.status === 401) {
      errorMessage = 'Session expirée. Veuillez vous reconnecter.';
    } else if (error.status === 403) {
      errorMessage = 'Vous n\'avez pas les permissions pour effectuer cette action.';
    } else if (error.status === 404) {
      errorMessage = 'Ressource non trouvée.';
    } else if (error.status >= 500) {
      errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}