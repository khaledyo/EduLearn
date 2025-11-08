import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cours } from '../../services/cours.service';

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

  constructor(private fb: FormBuilder) {
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
        enseignantId: this.getEnseignantId()
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      titre: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      support: [''],
      enseignantId: [this.getEnseignantId()]
    });
  }

  getEnseignantId(): number {
    return parseInt(localStorage.getItem('id') || '0');
  }

  populateForm(): void {
    if (this.cours) {
      this.coursForm.patchValue({
        id: this.cours.id,
        titre: this.cours.titre,
        description: this.cours.description,
        support: this.cours.support || '',
        enseignantId: this.cours.enseignantId
      });
    }
  }

  onClose(): void {
    this.closeModal.emit();
    this.coursForm.reset({
      enseignantId: this.getEnseignantId()
    });
  }

  onSubmit(): void {
    if (this.coursForm.valid) {
      this.submitCours.emit(this.coursForm.value);
    } else {
      this.markFormGroupTouched(this.coursForm);
    }
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
  get titre() { return this.coursForm.get('titre'); }
  get description() { return this.coursForm.get('description'); }
  get support() { return this.coursForm.get('support'); }
}