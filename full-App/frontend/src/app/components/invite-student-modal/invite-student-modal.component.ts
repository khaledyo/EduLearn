import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../../core/api-config';
import { ClassService } from '../../services/class.service';

@Component({
  selector: 'app-invite-student-modal',
  templateUrl: './invite-student-modal.component.html',
  styleUrls: ['./invite-student-modal.component.css']
})
export class InviteStudentModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() classId: number | undefined;

  @Output() closeModal = new EventEmitter<void>();
  @Output() studentAdded = new EventEmitter<any>();

  inviteForm: FormGroup;
  isLoading = false;
  searchResults: any[] = [];
  isSearching = false;

  private readonly baseUrl = API_CONFIG.baseUrl;

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private classService: ClassService
  ) {
    this.inviteForm = this.createForm();
  }

  ngOnInit(): void {
    // Reset form when modal opens
    if (this.showModal) {
      this.inviteForm.reset();
      this.searchResults = [];
    }
  }

  ngOnChanges(): void {
    if (this.showModal) {
      this.inviteForm.reset();
      this.searchResults = [];
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onClose(): void {
    this.closeModal.emit();
    this.inviteForm.reset();
    this.searchResults = [];
  }

  onEmailBlur(): void {
    if (this.email?.valid) {
      this.searchStudent();
    }
  }

  searchStudent(): void {
    const email = this.inviteForm.get('email')?.value?.trim();
    if (!email || !this.inviteForm.get('email')?.valid) {
      return;
    }

    this.isSearching = true;
    this.searchResults = [];
    this.searchStudentByEmail(email).subscribe({
      next: (student) => {
        this.searchResults = [student];
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Erreur lors de la recherche:', error);
        this.searchResults = [];
        this.isSearching = false;
        // Show error message
        if (error.message) {
          alert(error.message);
        }
      }
    });
  }

  private searchStudentByEmail(email: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return this.http.get<any>(`${this.baseUrl}/teacher/search-student?email=${encodeURIComponent(email)}`, {
      headers: new HttpHeaders(headers)
    }).pipe(
      catchError(error => {
        if (error.status === 404) {
          return throwError(() => new Error('Étudiant non trouvé avec cet email'));
        }
        return throwError(() => new Error('Erreur lors de la recherche de l\'étudiant'));
      })
    );
  }

  inviteStudent(student: any): void {
    if (!this.classId || !student.id) {
      return;
    }

    this.isLoading = true;
    this.classService.addStudentToClass(this.classId, student.id).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.studentAdded.emit(response.student || student);
        this.onClose();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur lors de l\'ajout de l\'étudiant:', error);
        alert(error.message || 'Erreur lors de l\'ajout de l\'étudiant');
      }
    });
  }

  get email() { return this.inviteForm.get('email'); }
}

