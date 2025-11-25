import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizExamService, Quiz, QuizQuestion } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-quiz-detail-modal',
  templateUrl: './quiz-detail-modal.component.html',
  styleUrls: ['./quiz-detail-modal.component.css']
})
export class QuizDetailModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() quizId!: number;

  @Output() closeModal = new EventEmitter<void>();

  quiz: Quiz | null = null;
  questions: QuizQuestion[] = [];
  isLoading = false;
  showQuestionForm = false;
  editingQuestion: QuizQuestion | null = null;
  questionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private quizExamService: QuizExamService
  ) {
    this.questionForm = this.createQuestionForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal && this.quizId) {
      this.loadQuiz();
    }
    if (!this.showModal) {
      this.resetForm();
    }
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required]],
      option_a: ['', [Validators.required]],
      option_b: ['', [Validators.required]],
      option_c: ['', [Validators.required]],
      option_d: ['', [Validators.required]],
      correct_option: ['a', [Validators.required]]
    });
  }

  loadQuiz(): void {
    if (!this.quizId) return;
    
    this.isLoading = true;
    this.quizExamService.getQuiz(this.quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.questions = quiz.questions || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du quiz:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement du quiz');
      }
    });
  }

  openAddQuestion(): void {
    this.editingQuestion = null;
    this.resetForm();
    this.showQuestionForm = true;
  }

  openEditQuestion(question: QuizQuestion): void {
    this.editingQuestion = question;
    this.questionForm.patchValue({
      question: question.question,
      option_a: question.option_a,
      option_b: question.option_b,
      option_c: question.option_c,
      option_d: question.option_d,
      correct_option: question.correct_option
    });
    this.showQuestionForm = true;
  }

  cancelQuestionForm(): void {
    this.showQuestionForm = false;
    this.resetForm();
  }

  onSubmitQuestion(): void {
    if (this.questionForm.valid && this.quizId) {
      const questionData = this.questionForm.value;
      
      if (this.editingQuestion) {
        // Update existing question
        this.quizExamService.updateQuizQuestion(
          this.quizId,
          this.editingQuestion.id!,
          questionData
        ).subscribe({
          next: () => {
            this.loadQuiz();
            this.cancelQuestionForm();
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            alert(error.error?.message || 'Erreur lors de la mise à jour de la question');
          }
        });
      } else {
        // Create new question
        this.quizExamService.createQuizQuestion(
          this.quizId,
          { ...questionData, quiz_id: this.quizId }
        ).subscribe({
          next: () => {
            this.loadQuiz();
            this.cancelQuestionForm();
          },
          error: (error) => {
            console.error('Erreur lors de la création:', error);
            alert(error.error?.message || 'Erreur lors de la création de la question');
          }
        });
      }
    } else {
      this.markFormGroupTouched(this.questionForm);
    }
  }

  deleteQuestion(questionId: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.quizExamService.deleteQuizQuestion(this.quizId, questionId).subscribe({
        next: () => {
          this.loadQuiz();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert(error.error?.message || 'Erreur lors de la suppression de la question');
        }
      });
    }
  }

  resetForm(): void {
    this.questionForm.reset({
      correct_option: 'a'
    });
    this.editingQuestion = null;
    this.showQuestionForm = false;
  }

  onClose(): void {
    this.closeModal.emit();
    this.resetForm();
    this.quiz = null;
    this.questions = [];
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get question() { return this.questionForm.get('question'); }
  get option_a() { return this.questionForm.get('option_a'); }
  get option_b() { return this.questionForm.get('option_b'); }
  get option_c() { return this.questionForm.get('option_c'); }
  get option_d() { return this.questionForm.get('option_d'); }
  get correct_option() { return this.questionForm.get('correct_option'); }
}

