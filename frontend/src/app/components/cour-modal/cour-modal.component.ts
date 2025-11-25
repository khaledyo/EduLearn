import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cours } from '../../services/cours.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-cours-modal',
  templateUrl: './cour-modal.component.html',
  styleUrls: ['./cour-modal.component.css']
})
export class CoursModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() cours: Cours | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitCours = new EventEmitter<any>();
  @Output() fileChange = new EventEmitter<File>();

  coursForm: FormGroup;
  selectedFiles: File[] = [];

  constructor(private fb: FormBuilder, private loginService: LoginService) {
    this.coursForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.cours && this.isEditMode) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.cours && this.isEditMode) {
      this.populateForm();
    } else if (!this.isEditMode) {
      this.coursForm.reset();
      this.coursForm.patchValue({
        teacher_id: this.getEnseignantId()
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      teacher_id: [this.getEnseignantId()]
    });
  }

  getEnseignantId(): number {
    return this.loginService.getUserId() ?? 0;
  }

  populateForm(): void {
    if (this.cours) {
      this.coursForm.patchValue({
        id: this.cours.id,
        title: this.cours.title ?? this.cours.titre,
        description: this.cours.description,
        teacher_id: this.cours.teacher_id ?? this.cours.enseignantId ?? this.getEnseignantId()
      });
    }
  }

  onClose(): void {
    this.closeModal.emit();
    this.coursForm.reset({
      teacher_id: this.getEnseignantId()
    });
    this.selectedFiles = [];
  }

  onSubmit(): void {
    if (this.coursForm.valid) {
      const formData = {
        ...this.coursForm.value,
        files: this.selectedFiles
      };
      this.submitCours.emit(formData);
    } else {
      this.markFormGroupTouched(this.coursForm);
    }
  }

  onFilesSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
    } else {
      this.selectedFiles = [];
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.fileChange.emit(file);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour un accès facile aux contrôles du formulaire
  get title() { return this.coursForm.get('title'); }
  get description() { return this.coursForm.get('description'); }
  get support() { return this.coursForm.get('support'); }
}