import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from '../core/api-config';

export interface Cours {
  id?: number;
  title: string; // English name (UI model)
  description: string;
  support?: string | string[];
  created_at?: string | Date;
  teacher_id: number;
  teacher_name?: string;
  teacher_first_name?: string;
  duration?: number;
  level?: string;
  class_id?: number; // For class-specific courses
  class_name?: string; // Name of the class if course is class-specific
  // Legacy French fields for backend compatibility
  titre?: string;
  dateCreation?: string | Date;
  enseignantId?: number;
  enseignantNom?: string;
  enseignantPrenom?: string;
  duree?: number;
  niveau?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoursService {
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly apiUrl = `${this.baseUrl}/enseignant/cours`;
  private readonly publicCoursesUrl = `${this.baseUrl}/public-courses`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
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

  private mapBackendToFrontend(backendCours: any): Cours {
    const support = this.normalizeSupports(backendCours?.support);

    return {
      id: backendCours?.id,
      title: backendCours?.title ?? backendCours?.titre ?? 'Sans titre',
      description: backendCours?.description ?? '',
      support,
      created_at: backendCours?.created_at ?? backendCours?.dateCreation,
      teacher_id: backendCours?.teacher_id ?? backendCours?.enseignantId ?? 0,
      teacher_name: backendCours?.teacher_name ?? backendCours?.enseignantNom,
      teacher_first_name: backendCours?.teacher_first_name ?? backendCours?.enseignantPrenom,
      duration: backendCours?.duration ?? backendCours?.duree,
      level: backendCours?.level ?? backendCours?.niveau,
      class_id: backendCours?.class_id,
      class_name: backendCours?.class_name,
      titre: backendCours?.titre,
      dateCreation: backendCours?.dateCreation,
      enseignantId: backendCours?.enseignantId,
      enseignantNom: backendCours?.enseignantNom,
      enseignantPrenom: backendCours?.enseignantPrenom,
      duree: backendCours?.duree,
      niveau: backendCours?.niveau
    };
  }

  private mapFrontendToBackend(frontendCours: Cours): any {
    return {
      titre: frontendCours.title ?? frontendCours.titre,
      description: frontendCours.description,
      support: this.supportsToString(frontendCours.support),
      duree: frontendCours.duration ?? frontendCours.duree,
      niveau: frontendCours.level ?? frontendCours.niveau,
      class_id: frontendCours.class_id
    };
  }

  /**
   * CREATE - Créer un nouveau cours
   * Backend endpoint: POST /api/enseignant/cours
   * Backend expects: { titre, description, files (File[]), duree (optional), niveau (optional), class_id (optional) }
   */
  createCours(cours: Cours, classId?: number, files?: File[]): Observable<Cours> {
    const formData = new FormData();
    
    // Add course data
    formData.append('titre', cours.title ?? cours.titre ?? '');
    formData.append('description', cours.description ?? '');
    if (classId) {
      formData.append('class_id', classId.toString());
    }
    
    // Add files
    if (files && files.length > 0) {
      files.forEach((file, index) => {
        formData.append(`files[]`, file, file.name);
      });
    }

    // For FormData, we need to include auth token but NOT set Content-Type
    // Browser will automatically set Content-Type with boundary for multipart/form-data
    const headers = this.getAuthHeaders();

    return this.http.post<any>(this.apiUrl, formData, {
      headers: headers
    }).pipe(
      map(response => this.mapBackendToFrontend(response)),
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer tous les cours d'un enseignant
   * Backend endpoint: GET /api/enseignant/cours/enseignant/{enseignantId}
   * Backend returns: array of cours objects with French field names
   */
  getCoursByEnseignant(enseignantId: number): Observable<Cours[]> {
    return this.http.get<any[]>(`${this.apiUrl}/enseignant/${enseignantId}`, {
      headers: this.getHeaders()
    }).pipe(
      map(coursList => {
        if (!Array.isArray(coursList)) {
          return [];
        }
        return coursList.map(cours => this.mapBackendToFrontend(cours));
      }),
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * READ - Récupérer tous les cours (pour étudiant)
   */
  getTousLesCours(): Observable<Cours[]> {
    return this.http.get<any[]>(this.publicCoursesUrl, {
      headers: new HttpHeaders({
        'Accept': 'application/json'
      })
    }).pipe(
      map(coursList => coursList.map(cours => this.mapBackendToFrontend(cours))),
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer un cours par son ID
   */
  getCoursById(id: number): Observable<Cours> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, {
      headers: this.getHeaders() 
    }).pipe(
      map(cours => this.mapBackendToFrontend(cours)),
      catchError(this.handleError)
    );
  }

  /**
   * UPDATE - Mettre à jour un cours
   * Backend endpoint: PUT /api/enseignant/cours/{id}
   * Backend expects: { titre, description, support (string), duree (optional), niveau (optional) }
   */
  updateCours(id: number, cours: Cours): Observable<Cours> {
    const coursToSend = this.mapFrontendToBackend(cours);

    return this.http.put<any>(`${this.apiUrl}/${id}`, coursToSend, {
      headers: this.getHeaders() 
    }).pipe(
      map(response => this.mapBackendToFrontend(response)),
      catchError(this.handleError)
    );
  }

  /**
   * ADD SUPPORTS - Ajouter des supports à un cours
   * Backend endpoint: POST /api/enseignant/cours/{id}/supports
   * Backend expects: FormData with files[]
   */
  addSupportsToCours(id: number, files: File[]): Observable<Cours> {
    const formData = new FormData();
    
    // Add files
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('files[]', file, file.name);
      });
    }

    // For FormData, we need to include auth token but NOT set Content-Type
    // Browser will automatically set Content-Type with boundary for multipart/form-data
    const headers = this.getAuthHeaders();

    return this.http.post<any>(`${this.apiUrl}/${id}/supports`, formData, {
      headers: headers
    }).pipe(
      map(response => this.mapBackendToFrontend(response)),
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
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, limit)
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

    return this.http.get<any[]>(`${this.apiUrl}/recherche`, {
      headers: this.getHeaders(),
      params 
    }).pipe(
      map(coursList => coursList.map(cours => this.mapBackendToFrontend(cours))),
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
        if (user.nom) {
          return user.nom;
        }
        if (user.name) {
          const parts = user.name.trim().split(/\s+/);
          return parts.length > 1 ? parts.slice(-1).join(' ') : parts[0];
        }
        return 'Enseignant';
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
        if (user.prenom) {
          return user.prenom;
        }
        if (user.name) {
          return user.name.trim().split(/\s+/)[0];
        }
        return 'Inconnu';
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