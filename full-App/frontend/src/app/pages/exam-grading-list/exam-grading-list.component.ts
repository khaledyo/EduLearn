import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizExamService, Exam, ExamResult } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-exam-grading-list',
  templateUrl: './exam-grading-list.component.html',
  styleUrls: ['./exam-grading-list.component.css']
})
export class ExamGradingListComponent implements OnInit {
  exam: Exam | null = null;
  examResults: ExamResult[] = [];
  isLoading = true;
  searchTerm = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizExamService: QuizExamService
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId');
    if (examId) {
      this.loadExamAndResults(+examId);
    }
  }

  loadExamAndResults(examId: number): void {
    this.isLoading = true;
    
    // Get exam details
    this.quizExamService.getExam(examId).subscribe({
      next: (exam) => {
        this.exam = exam;
      },
      error: (error) => {
        console.error('Error loading exam:', error);
        this.isLoading = false;
      }
    });

    // Get exam results (all student submissions)
    this.quizExamService.getExamResults(examId).subscribe({
      next: (results) => {
        this.examResults = results;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.isLoading = false;
      }
    });
  }

  gradeStudent(result: ExamResult): void {
    // Navigate to exam answer review page
    console.log('Grading student:', {
      resultId: result.id,
      studentName: result.student?.name,
      examId: this.exam?.id,
      examTitle: this.exam?.title
    });

    this.router.navigate(['/exam-answer-review', result.id], {
      queryParams: {
        examId: this.exam?.id,
        examName: this.exam?.title
      }
    });
  }

  getFilteredResults(): ExamResult[] {
    if (!this.searchTerm) {
      return this.examResults;
    }
    
    const term = this.searchTerm.toLowerCase();
    return this.examResults.filter(result => 
      result.student?.name.toLowerCase().includes(term) ||
      result.student?.email.toLowerCase().includes(term)
    );
  }

  getStatusBadgeClass(score: number | null | undefined): string {
    if (score === null || score === undefined) {
      return 'badge bg-warning';
    }
    return 'badge bg-success';
  }

  getStatusText(score: number | null | undefined): string {
    if (score === null || score === undefined) {
      return 'En attente';
    }
    return `Noté: ${score}`;
  }

  getPendingCount(): number {
    return this.examResults.filter(r => r.score === null || r.score === undefined).length;
  }

  getGradedCount(): number {
    return this.examResults.filter(r => r.score !== null && r.score !== undefined).length;
  }

  getTotalCount(): number {
    return this.examResults.length;
  }

  goBack(): void {
    this.router.navigate(['/catalogue-cours']);
  }
}
