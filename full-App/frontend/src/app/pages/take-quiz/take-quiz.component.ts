import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizExamService, Quiz, QuizQuestion, QuizResult } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-take-quiz',
  templateUrl: './take-quiz.component.html',
  styleUrls: ['./take-quiz.component.css']
})
export class TakeQuizComponent implements OnInit {
  quiz: Quiz | null = null;
  questions: QuizQuestion[] = [];
  isLoading = true;
  isSubmitting = false;
  currentQuestionIndex = 0;
  answers: { [key: number]: string } = {};
  quizResult: QuizResult | null = null;
  showResult = false;
  courseId: number | null = null;
  totalQuestions = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizExamService: QuizExamService
  ) {}

  ngOnInit(): void {
    this.courseId = this.route.snapshot.queryParamMap.get('courseId') ? 
      +this.route.snapshot.queryParamMap.get('courseId')! : null;
    this.loadQuiz();
  }

  loadQuiz(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (!quizId) {
      this.isLoading = false;
      alert('ID du quiz non trouvé');
      this.goBack();
      return;
    }

    this.quizExamService.getStudentQuiz(+quizId).subscribe({
      next: (quiz) => {
        this.quiz = quiz;
        this.loadQuestions(+quizId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du quiz:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement du quiz');
        this.goBack();
      }
    });
  }

  loadQuestions(quizId: number): void {
    this.quizExamService.getStudentQuizQuestions(quizId).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.totalQuestions = questions.length;
        this.isLoading = false;
        // Initialize answers object
        this.questions.forEach(q => {
          this.answers[q.id!] = '';
        });
      },
      error: (error) => {
        console.error('Erreur lors du chargement des questions:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement des questions');
      }
    });
  }

  getCurrentQuestion(): QuizQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  selectAnswer(option: string): void {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      this.answers[currentQuestion.id!] = option;
    }
  }

  isAnswerSelected(option: string): boolean {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? this.answers[currentQuestion.id!] === option : false;
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  previousQuestion(): void {
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  canProceedNext(): boolean {
    return this.currentQuestionIndex < this.questions.length - 1;
  }

  canProceedPrev(): boolean {
    return this.currentQuestionIndex > 0;
  }

  getAnsweredCount(): number {
    return Object.values(this.answers).filter(a => a !== '').length;
  }

  submitQuiz(): void {
    if (confirm('Êtes-vous sûr de vouloir soumettre le quiz? Vous ne pourrez pas le modifier après.')) {
      this.isSubmitting = true;
      
      if (!this.quiz?.id) return;

      // Prepare answers in the format expected by backend
      const answersData: { [key: number]: string } = {};
      this.questions.forEach(q => {
        answersData[q.id!] = this.answers[q.id!];
      });

      this.quizExamService.submitQuiz(this.quiz.id, answersData).subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.quizResult = result;
          this.showResult = true;
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erreur lors de la soumission:', error);
          alert(error.error?.message || 'Erreur lors de la soumission du quiz');
        }
      });
    }
  }

  goBack(): void {
    if (this.courseId) {
      this.router.navigate(['/cours-detail-etudiant', this.courseId]);
    } else {
      this.router.navigate(['/catalogue-cours']);
    }
  }

  goToCourse(): void {
    if (this.courseId) {
      this.router.navigate(['/cours-detail-etudiant', this.courseId]);
    }
  }
}
