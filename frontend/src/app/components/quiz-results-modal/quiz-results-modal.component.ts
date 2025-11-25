import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { QuizExamService, QuizResult } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-quiz-results-modal',
  templateUrl: './quiz-results-modal.component.html',
  styleUrls: ['./quiz-results-modal.component.css']
})
export class QuizResultsModalComponent implements OnInit, OnChanges {
  @Input() showModal: boolean = false;
  @Input() quizId!: number;

  @Output() closeModal = new EventEmitter<void>();

  results: QuizResult[] = [];
  isLoading = false;
  quizTitle: string = '';
  totalQuestions: number = 0;

  constructor(private quizExamService: QuizExamService) {}

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showModal'] && this.showModal && this.quizId) {
      this.loadResults();
    }
  }

  loadResults(): void {
    if (!this.quizId) return;
    
    this.isLoading = true;
    
    // First load quiz to get total questions
    this.quizExamService.getQuiz(this.quizId).subscribe({
      next: (quiz) => {
        this.quizTitle = quiz.title;
        this.totalQuestions = quiz.questions?.length || 0;
        
        // Then load results
        this.quizExamService.getQuizResults(this.quizId).subscribe({
          next: (results) => {
            this.results = results;
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
        console.error('Erreur lors du chargement du quiz:', error);
        this.isLoading = false;
      }
    });
  }

  onClose(): void {
    this.closeModal.emit();
    this.results = [];
    this.totalQuestions = 0;
  }

  getTotalQuestions(): number {
    return this.totalQuestions || 0;
  }
}

