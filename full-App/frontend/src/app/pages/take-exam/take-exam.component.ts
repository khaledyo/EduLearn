import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizExamService, Exam, ExamQuestion } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-take-exam',
  templateUrl: './take-exam.component.html',
  styleUrls: ['./take-exam.component.css']
})
export class TakeExamComponent implements OnInit {
  exam: Exam | null = null;
  questions: ExamQuestion[] = [];
  isLoading = true;
  isSubmitting = false;
  currentQuestionIndex = 0;
  answers: { [key: number]: string } = {};
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
    this.loadExam();
  }

  loadExam(): void {
    const examId = this.route.snapshot.paramMap.get('id');
    if (!examId) {
      this.isLoading = false;
      alert('ID de l\'examen non trouvé');
      this.goBack();
      return;
    }

    this.quizExamService.getStudentExam(+examId).subscribe({
      next: (exam) => {
        this.exam = exam;
        this.loadQuestions(+examId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'examen:', error);
        this.isLoading = false;
        alert('Erreur lors du chargement de l\'examen');
        this.goBack();
      }
    });
  }

  loadQuestions(examId: number): void {
    this.quizExamService.getStudentExamQuestions(examId).subscribe({
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

  getCurrentQuestion(): ExamQuestion | null {
    return this.questions[this.currentQuestionIndex] || null;
  }

  updateAnswer(text: string): void {
    const currentQuestion = this.getCurrentQuestion();
    if (currentQuestion) {
      this.answers[currentQuestion.id!] = text;
    }
  }

  getCurrentAnswer(): string {
    const currentQuestion = this.getCurrentQuestion();
    return currentQuestion ? this.answers[currentQuestion.id!] || '' : '';
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
    return Object.values(this.answers).filter(a => a && a.trim() !== '').length;
  }

  submitExam(): void {
    const emptyCount = this.totalQuestions - this.getAnsweredCount();
    if (emptyCount > 0) {
      const confirmMessage = `${emptyCount} question(s) n'ont pas de réponse. Êtes-vous sûr de vouloir soumettre?`;
      if (!confirm(confirmMessage)) {
        return;
      }
    }

    if (confirm('Êtes-vous sûr de vouloir soumettre l\'examen? Vous ne pourrez pas le modifier après.')) {
      this.isSubmitting = true;
      
      if (!this.exam?.id) return;

      // Prepare answers in the format expected by backend
      const answersData: { [key: number]: string } = {};
      this.questions.forEach(q => {
        answersData[q.id!] = this.answers[q.id!];
      });

      this.quizExamService.submitExam(this.exam.id, answersData).subscribe({
        next: (result) => {
          this.isSubmitting = false;
          this.showResult = true;
        },
        error: (error) => {
          this.isSubmitting = false;
          console.error('Erreur lors de la soumission:', error);
          alert(error.error?.message || 'Erreur lors de la soumission de l\'examen');
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
