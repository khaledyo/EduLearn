import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-add-support-modal',
  templateUrl: './add-support-modal.component.html',
  styleUrls: ['./add-support-modal.component.css']
})
export class AddSupportModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() existingSupports: string[] = [];

  @Output() closeModal = new EventEmitter<void>();
  @Output() submitSupports = new EventEmitter<File[]>();

  supportForm: FormGroup;
  selectedFiles: File[] = [];
  fileInputTouched: boolean = false;

  constructor(private fb: FormBuilder) {
    this.supportForm = this.createForm();
  }

  ngOnInit(): void {
    // Form starts empty - this is for adding NEW supports only
  }

  ngOnChanges(): void {
    // Reset form when modal opens/closes
    if (!this.showModal) {
      this.supportForm.reset();
      this.selectedFiles = [];
      this.fileInputTouched = false;
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      supportFiles: [null]
    });
  }

  onClose(): void {
    this.closeModal.emit();
    this.supportForm.reset();
    this.selectedFiles = [];
    this.fileInputTouched = false;
    // Reset file input
    const fileInput = document.getElementById('supportFiles') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onFilesSelected(event: any): void {
    this.fileInputTouched = true;
    const files = event.target.files;
    if (files && files.length > 0) {
      this.selectedFiles = Array.from(files);
      // Mark form as valid when files are selected
      this.supportForm.patchValue({
        supportFiles: this.selectedFiles
      });
    } else {
      this.selectedFiles = [];
    }
  }

  onSubmit(): void {
    if (this.selectedFiles.length > 0) {
      this.submitSupports.emit(this.selectedFiles);
      this.supportForm.reset();
      this.selectedFiles = [];
      this.fileInputTouched = false;
      // Reset file input
      const fileInput = document.getElementById('supportFiles') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } else {
      this.fileInputTouched = true;
      alert('Veuillez sélectionner au moins un fichier');
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get supportFiles() { return this.supportForm.get('supportFiles'); }
}

