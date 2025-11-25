import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizExamService, Exam, ExamQuestion } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-exam-detail-modal',
  templateUrl: './exam-detail-modal.component.html',
  styleUrls: ['./exam-detail-modal.component.css']
})
export class ExamDetailModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() examId!: number;

  @Output() closeModal = new EventEmitter<void>();

  exam: Exam | null = null;
  questions: ExamQuestion[] = [];
  isLoading = false;
  showQuestionForm = false;
  editingQuestion: ExamQuestion | null = null;
  questionForm: FormGroup;
  canEdit = true;

  constructor(
    private fb: FormBuilder,
    private quizExamService: QuizExamService
  ) {
    this.questionForm = this.createQuestionForm();
  }

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal && this.examId) {
      this.loadExam();
    }
    if (!this.showModal) {
      this.resetForm();
    }
  }

  createQuestionForm(): FormGroup {
    return this.fb.group({
      question: ['', [Validators.required]],
      correct_answer: [''] // Optional reference for teacher
    });
  }

  loadExam(): void {
    if (!this.examId) return;
    
    this.isLoading = true;
    this.quizExamService.getExam(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.questions = exam.questions || [];
        this.canEdit = !exam.has_results; // Can't edit if students have taken it
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement de l\'examen');
      }
    });
  }

  openAddQuestion(): void {
    if (!this.canEdit) {
      alert('Cet examen ne peut plus être modifié car des étudiants l\'ont déjà passé.');
      return;
    }
    this.editingQuestion = null;
    this.resetForm();
    this.showQuestionForm = true;
  }

  openEditQuestion(question: ExamQuestion): void {
    if (!this.canEdit) {
      alert('Cet examen ne peut plus être modifié car des étudiants l\'ont déjà passé.');
      return;
    }
    this.editingQuestion = question;
    this.questionForm.patchValue({
      question: question.question,
      correct_answer: question.correct_answer || ''
    });
    this.showQuestionForm = true;
  }

  cancelQuestionForm(): void {
    this.showQuestionForm = false;
    this.resetForm();
  }

  onSubmitQuestion(): void {
    if (this.questionForm.valid && this.examId && this.canEdit) {
      const questionData = this.questionForm.value;
      
      if (this.editingQuestion) {
        // Update existing question
        this.quizExamService.updateExamQuestion(
          this.examId,
          this.editingQuestion.id!,
          questionData
        ).subscribe({
          next: () => {
            this.loadExam();
            this.cancelQuestionForm();
          },
          error: (error) => {
            console.error('Erreur lors de la mise à jour:', error);
            alert(error.error?.message || 'Erreur lors de la mise à jour de la question');
          }
        });
      } else {
        // Create new question
        this.quizExamService.createExamQuestion(
          this.examId,
          { ...questionData, exam_id: this.examId }
        ).subscribe({
          next: () => {
            this.loadExam();
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
    if (!this.canEdit) {
      alert('Cet examen ne peut plus être modifié car des étudiants l\'ont déjà passé.');
      return;
    }
    if (confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      this.quizExamService.deleteExamQuestion(this.examId, questionId).subscribe({
        next: () => {
          this.loadExam();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert(error.error?.message || 'Erreur lors de la suppression de la question');
        }
      });
    }
  }

  resetForm(): void {
    this.questionForm.reset();
    this.editingQuestion = null;
    this.showQuestionForm = false;
  }

  onClose(): void {
    this.closeModal.emit();
    this.resetForm();
    this.exam = null;
    this.questions = [];
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get question() { return this.questionForm.get('question'); }
  get correct_answer() { return this.questionForm.get('correct_answer'); }
}

