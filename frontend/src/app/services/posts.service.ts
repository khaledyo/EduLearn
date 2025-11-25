import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { API_CONFIG } from '../core/api-config';

@Injectable({ providedIn: 'root' })
export class PostsService {
  private readonly base = API_CONFIG.baseUrl;
  private readonly postsUrl = `${this.base}/posts`;

  constructor(private http: HttpClient) { }

  private getAuthHeaders(): HttpHeaders {
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

  createPost(courseId: number, content: string) {
    return this.http.post(this.postsUrl, { course_id: courseId, content }, { headers: this.getAuthHeaders() });
  }

  getPosts(courseId: number) {
    return this.http.get<any[]>(`${this.base}/posts/course/${courseId}`, { headers: this.getAuthHeaders() });
  }

  answerPost(postId: number, content: string) {
    return this.http.post(`${this.postsUrl}/${postId}/answer`, { content }, { headers: this.getAuthHeaders() });
  }
}
