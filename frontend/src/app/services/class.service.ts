import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG } from '../core/api-config';
import { Cours } from './cours.service';

export interface Class {
  id?: number;
  name: string;
  description?: string;
  teacher_id?: number;
  students_count?: number;
  created_at?: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ClassService {
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly apiUrl = `${this.baseUrl}/teacher/class`;

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

  /**
   * CREATE - Créer une nouvelle classe (now creates a request for admin approval)
   */
  createClass(classe: { name: string; description?: string }): Observable<Class> {
    return this.http.post<Class>(`${this.baseUrl}/teacher/class-requests`, classe, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer toutes les classes du professeur
   */
  getMyClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.baseUrl}/teacher/my-classes`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        // If 500 error or table doesn't exist, return empty array
        if (error.status === 500 || error.status === 0) {
          console.warn('Erreur serveur lors de la récupération des classes, retour d\'un tableau vide');
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * READ - Récupérer une classe par ID
   */
  getClassById(id: number): Observable<Class> {
    // Get all classes and find the one with matching ID
    return this.http.get<Class[]>(`${this.baseUrl}/teacher/my-classes`, {
      headers: this.getHeaders()
    }).pipe(
      map(classes => {
        const foundClass = classes.find(c => c.id === id);
        if (!foundClass) {
          throw new Error('Classe non trouvée');
        }
        return foundClass;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer les étudiants d'une classe
   */
  getClassStudents(classId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${classId}/students`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST - Ajouter un étudiant directement à une classe (invitation)
   */
  addStudentToClass(classId: number, studentId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${classId}/student`, {
      student_id: studentId
    }, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Retirer un étudiant d'une classe
   */
  removeStudent(classId: number, studentId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${classId}/student/${studentId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * PUT - Mettre à jour une classe
   */
  updateClass(classId: number, classe: { name: string; description?: string }): Observable<Class> {
    return this.http.put<Class>(`${this.baseUrl}/teacher/class/${classId}`, classe, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * DELETE - Supprimer une classe
   */
  deleteClass(classId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/teacher/class/${classId}`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * READ - Récupérer les classes d'un étudiant
   */
  getStudentClasses(): Observable<Class[]> {
    return this.http.get<Class[]>(`${this.baseUrl}/student/my-classes`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          console.warn('Erreur serveur lors de la récupération des classes, retour d\'un tableau vide');
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * READ - Récupérer les cours d'une classe (pour étudiants)
   */
  getClassCourses(classId: number): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/student/class/${classId}/courses`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          console.warn('Erreur serveur lors de la récupération des cours de la classe, retour d\'un tableau vide');
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * READ - Récupérer les cours d'une classe (pour enseignants)
   */
  getClassCoursesForTeacher(classId: number): Observable<Cours[]> {
    return this.http.get<Cours[]>(`${this.baseUrl}/teacher/class/${classId}/courses`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(error => {
        if (error.status === 500 || error.status === 0) {
          console.warn('Erreur serveur lors de la récupération des cours de la classe, retour d\'un tableau vide');
          return of([]);
        }
        return this.handleError(error);
      })
    );
  }

  /**
   * Gestion centralisée des erreurs
   */
  private handleError(error: any): Observable<never> {
    console.error('Erreur dans ClassService:', error);
    
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

