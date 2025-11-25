import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api-config';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly base = API_CONFIG.baseUrl;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    console.log('AdminService: token present?', !!token);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return new HttpHeaders(headers);
  }

  getStats() { return this.http.get<any>(this.base + '/admin/stats', { headers: this.getAuthHeaders() }); }
  getUsers() { return this.http.get<any[]>(this.base + '/admin/users', { headers: this.getAuthHeaders() }); }
  getUser(id: number) { return this.http.get<any>(this.base + '/admin/users/' + id, { headers: this.getAuthHeaders() }); }
  updateUser(id: number, payload: any) { return this.http.put<any>(this.base + '/admin/users/' + id, payload, { headers: this.getAuthHeaders() }); }
  deleteUser(id: number) { return this.http.delete(this.base + '/admin/users/' + id, { headers: this.getAuthHeaders() }); }

  // Class requests
  getClassRequests() { return this.http.get<any[]>(this.base + '/admin/class-requests', { headers: this.getAuthHeaders() }); }
  approveClassRequest(id: number) { return this.http.post(this.base + '/admin/class-requests/' + id + '/approve', {}, { headers: this.getAuthHeaders() }); }
  rejectClassRequest(id: number) { return this.http.post(this.base + '/admin/class-requests/' + id + '/reject', {}, { headers: this.getAuthHeaders() }); }

  // Classes listing (admin view)
  getClasses() { return this.http.get<any[]>(this.base + '/admin/classes', { headers: this.getAuthHeaders() }); }

  // Course requests (admin approval)
  getCourseRequests() { return this.http.get<any[]>(this.base + '/admin/course-requests', { headers: this.getAuthHeaders() }); }
  approveCourseRequest(id: number) { return this.http.post(this.base + '/admin/course-requests/' + id + '/approve', {}, { headers: this.getAuthHeaders() }); }
  rejectCourseRequest(id: number) { return this.http.post(this.base + '/admin/course-requests/' + id + '/reject', {}, { headers: this.getAuthHeaders() }); }

  // Admin delete with cascade (soft delete)
  deleteTeacher(id: number) { return this.http.delete(this.base + '/admin/teachers/' + id, { headers: this.getAuthHeaders() }); }
  deleteClass(id: number) { return this.http.delete(this.base + '/admin/classes/' + id, { headers: this.getAuthHeaders() }); }
  deleteCourse(id: number) { return this.http.delete(this.base + '/admin/courses/' + id, { headers: this.getAuthHeaders() }); }
}
