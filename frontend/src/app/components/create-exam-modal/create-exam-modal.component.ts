import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizExamService } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-create-exam-modal',
  templateUrl: './create-exam-modal.component.html',
  styleUrls: ['./create-exam-modal.component.css']
})
export class CreateExamModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() courseId!: number;

  @Output() closeModal = new EventEmitter<void>();
  @Output() examCreated = new EventEmitter<number>();

  examForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private quizExamService: QuizExamService
  ) {
    this.examForm = this.createForm();
  }

  ngOnInit(): void {}

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(191)]]
    });
  }

  onClose(): void {
    this.closeModal.emit();
    this.examForm.reset();
  }

  onSubmit(): void {
    if (this.examForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const examData = {
        title: this.examForm.get('title')?.value,
        course_id: this.courseId
      };

      this.quizExamService.createExam(examData).subscribe({
        next: (exam) => {
          this.examCreated.emit(exam.id);
          this.examForm.reset();
          this.isSubmitting = false;
          this.onClose();
        },
        error: (error) => {
          console.error('Erreur lors de la création de l\'examen:', error);
          alert(error.error?.message || 'Erreur lors de la création de l\'examen');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.examForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get title() { return this.examForm.get('title'); }
}

