import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { QuizExamService, ExamResult, Exam } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-exam-results-modal',
  templateUrl: './exam-results-modal.component.html',
  styleUrls: ['./exam-results-modal.component.css']
})
export class ExamResultsModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() examId!: number;

  @Output() closeModal = new EventEmitter<void>();

  exam: Exam | null = null;
  results: ExamResult[] = [];
  isLoading = false;
  scoreForms: Map<number, FormGroup> = new Map();

  constructor(
    private quizExamService: QuizExamService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal && this.examId) {
      this.loadExamAndResults();
    }
  }

  loadExamAndResults(): void {
    if (!this.examId) return;
    
    this.isLoading = true;
    
    // Load exam first to get questions
    this.quizExamService.getExam(this.examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        
        // Then load results
        this.quizExamService.getExamResults(this.examId).subscribe({
          next: (results) => {
            this.results = results;
            // Initialize score forms for each result
            results.forEach(result => {
              const form = this.fb.group({
                score: [result.score, [Validators.required, Validators.min(0)]]
              });
              this.scoreForms.set(result.id, form);
            });
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Erreur lors du chargement des résultats:', error);
            this.isLoading = false;
            alert('Erreur lors du chargement des résultats');
          }
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement de l\'examen');
      }
    });
  }

  getScoreForm(resultId: number): FormGroup {
    return this.scoreForms.get(resultId) || this.fb.group({ score: [0] });
  }

  updateScore(resultId: number): void {
    const form = this.scoreForms.get(resultId);
    if (form && form.valid && this.examId) {
      const score = form.get('score')?.value;
      this.quizExamService.updateExamScore(this.examId, resultId, score).subscribe({
        next: () => {
          // Reload results to get updated data
          this.loadExamAndResults();
          alert('Score mis à jour avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour du score:', error);
          alert(error.error?.message || 'Erreur lors de la mise à jour du score');
        }
      });
    }
  }

  getAnswerForQuestion(result: ExamResult, questionId: number): string {
    const answer = result.answers?.find(a => a.question_id === questionId);
    return answer?.answer || 'Aucune réponse';
  }

  getQuestionText(questionId: number): string {
    const question = this.exam?.questions?.find(q => q.id === questionId);
    return question?.question || 'Question introuvable';
  }

  onClose(): void {
    this.closeModal.emit();
    this.results = [];
    this.exam = null;
    this.scoreForms.clear();
  }
}

