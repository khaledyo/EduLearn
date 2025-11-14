import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizExamService } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-create-quiz-modal',
  templateUrl: './create-quiz-modal.component.html',
  styleUrls: ['./create-quiz-modal.component.css']
})
export class CreateQuizModalComponent implements OnInit {
  @Input() showModal: boolean = false;
  @Input() courseId!: number;

  @Output() closeModal = new EventEmitter<void>();
  @Output() quizCreated = new EventEmitter<number>();

  quizForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private quizExamService: QuizExamService
  ) {
    this.quizForm = this.createForm();
  }

  ngOnInit(): void {}

  createForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(191)]]
    });
  }

  onClose(): void {
    this.closeModal.emit();
    this.quizForm.reset();
  }

  onSubmit(): void {
    if (this.quizForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      const quizData = {
        title: this.quizForm.get('title')?.value,
        course_id: this.courseId
      };

      this.quizExamService.createQuiz(quizData).subscribe({
        next: (quiz) => {
          this.quizCreated.emit(quiz.id);
          this.quizForm.reset();
          this.isSubmitting = false;
          this.onClose();
        },
        error: (error) => {
          console.error('Erreur lors de la création du quiz:', error);
          alert(error.error?.message || 'Erreur lors de la création du quiz');
          this.isSubmitting = false;
        }
      });
    } else {
      this.markFormGroupTouched(this.quizForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get title() { return this.quizForm.get('title'); }
}

