import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-confirmation-modal',
  templateUrl: './delete-confirmation-modal.component.html',
  styleUrls: ['./delete-confirmation-modal.component.css']
})
export class DeleteConfirmationModalComponent {
  @Input() showModal: boolean = false;
  @Input() coursTitle: string = '';

  @Output() closeModal = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<void>();

  onClose(): void {
    this.closeModal.emit();
  }

  onConfirm(): void {
    this.confirmDelete.emit();
  }
}