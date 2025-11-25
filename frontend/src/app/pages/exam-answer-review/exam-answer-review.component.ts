import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizExamService, ExamResult, ExamQuestion } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-exam-answer-review',
  templateUrl: './exam-answer-review.component.html',
  styleUrls: ['./exam-answer-review.component.css']
})
export class ExamAnswerReviewComponent implements OnInit {
  examResult: ExamResult | null = null;
  exam: any = null;
  questions: ExamQuestion[] = [];
  isLoading = true;
  isSaving = false;
  score: number | null = null;
  scoreError = '';
  resultId: number | null = null;
  examId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizExamService: QuizExamService
  ) {}

  ngOnInit(): void {
    this.resultId = +this.route.snapshot.paramMap.get('resultId')!;
    this.examId = +this.route.snapshot.queryParamMap.get('examId')!;

    console.log('Component initialized with:');
    console.log('  resultId:', this.resultId, 'isNaN:', isNaN(this.resultId));
    console.log('  examId:', this.examId, 'isNaN:', isNaN(this.examId));
    console.log('  Raw params:', {
      resultIdRaw: this.route.snapshot.paramMap.get('resultId'),
      examIdRaw: this.route.snapshot.queryParamMap.get('examId')
    });

    if (this.resultId && !isNaN(this.resultId) && this.examId && !isNaN(this.examId)) {
      this.loadExamResult();
    } else {
      console.error('Missing or invalid parameters', { resultId: this.resultId, examId: this.examId });
      this.scoreError = 'Erreur: Paramètres manquants ou invalides';
      this.isLoading = false;
    }
  }

  loadExamResult(): void {
    this.isLoading = true;

    if (!this.examId || isNaN(this.examId)) {
      console.error('Invalid examId:', this.examId);
      this.isLoading = false;
      this.scoreError = 'Erreur: ID d\'examen invalide';
      return;
    }

    console.log('Loading exam result with examId:', this.examId, 'resultId:', this.resultId);

    // Get exam details first
    this.quizExamService.getExam(this.examId).subscribe({
      next: (exam) => {
        console.log('Exam loaded successfully:', exam);
        this.exam = exam;
        
        // Then get all results for this exam
        this.quizExamService.getExamResults(this.examId!).subscribe({
          next: (results: ExamResult[]) => {
            console.log('Results loaded:', results.length, 'results');
            // Find the specific result by ID
            const result = results.find(r => r.id === this.resultId);
            if (result) {
              console.log('Found result:', result);
              this.examResult = result;
              this.score = result.score;
              // Load questions
              this.loadQuestions();
            } else {
              console.error('Result not found with ID:', this.resultId);
              this.scoreError = 'Résultat d\'examen non trouvé';
              this.isLoading = false;
            }
          },
          error: (error: any) => {
            console.error('Error loading exam results:', error);
            this.scoreError = 'Erreur lors du chargement des résultats';
            this.isLoading = false;
          }
        });
      },
      error: (error: any) => {
        console.error('Error loading exam:', error);
        this.scoreError = 'Erreur lors du chargement de l\'examen';
        this.isLoading = false;
      }
    });
  }

  loadQuestions(): void {
    this.quizExamService.getExamQuestions(this.examId!).subscribe({
      next: (questions) => {
        this.questions = questions;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading questions:', error);
        this.isLoading = false;
      }
    });
  }

  getAnswerForQuestion(questionId: number): string {
    if (!this.examResult?.answers) {
      return '';
    }
    const answer = this.examResult.answers.find(a => a.question_id === questionId);
    return answer?.answer || '';
  }

  getQuestionText(questionId: number): string {
    const question = this.questions.find(q => q.id === questionId);
    return question?.question || '';
  }

  saveScore(): void {
    console.log('saveScore called with score:', this.score);
    console.log('examId:', this.examId, 'resultId:', this.examResult?.id);

    if (this.score === null || this.score === undefined) {
      this.scoreError = 'Veuillez entrer une note';
      return;
    }

    if (this.score < 0 || this.score > 20) {
      this.scoreError = 'La note doit être entre 0 et 20';
      return;
    }

    this.scoreError = '';
    this.isSaving = true;

    if (!this.examResult?.id) {
      this.scoreError = 'Erreur: ID du résultat manquant';
      this.isSaving = false;
      console.error('Missing result ID');
      return;
    }

    if (!this.examId) {
      this.scoreError = 'Erreur: ID d\'examen manquant';
      this.isSaving = false;
      console.error('Missing exam ID');
      return;
    }

    console.log('Calling updateExamScore with:', {
      examId: this.examId,
      resultId: this.examResult.id,
      score: this.score
    });

    this.quizExamService.updateExamScore(this.examId, this.examResult.id, this.score).subscribe({
      next: (result) => {
        console.log('Score saved successfully:', result);
        this.isSaving = false;
        alert('Note enregistrée avec succès!');
        // Navigate back to grading list
        this.router.navigate(['/exam-grading-list', this.examId]);
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error saving score:', error);
        this.scoreError = error.error?.message || 'Erreur lors de l\'enregistrement';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/exam-grading-list', this.examId]);
  }
}
