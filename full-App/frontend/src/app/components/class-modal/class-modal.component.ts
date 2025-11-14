import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Class } from '../../services/class.service';

@Component({
  selector: 'app-class-modal',
  templateUrl: './class-modal.component.html',
  styleUrls: ['./class-modal.component.css']
})
export class ClassModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() isEditMode: boolean = false;
  @Input() classe: Class | null = null;

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitClass = new EventEmitter<any>();

  classForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.classForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.classe && this.isEditMode) {
      this.populateForm();
    }
  }

  ngOnChanges(): void {
    if (this.classe && this.isEditMode) {
      this.populateForm();
    } else if (!this.isEditMode) {
      this.classForm.reset();
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      id: [null],
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['']
    });
  }

  populateForm(): void {
    if (this.classe) {
      this.classForm.patchValue({
        id: this.classe.id,
        name: this.classe.name,
        description: this.classe.description || ''
      });
    }
  }

  onClose(): void {
    this.closeModal.emit();
    this.classForm.reset();
  }

  onSubmit(): void {
    if (this.classForm.valid) {
      this.submitClass.emit(this.classForm.value);
    } else {
      this.markFormGroupTouched(this.classForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  // Getters pour un accès facile aux contrôles du formulaire
  get name() { return this.classForm.get('name'); }
  get description() { return this.classForm.get('description'); }
}

