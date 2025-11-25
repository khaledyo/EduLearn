import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { API_CONFIG } from '../core/api-config';

export interface Quiz {
  id?: number;
  title: string;
  course_id: number;
  questions?: QuizQuestion[];
  created_at?: string;
  updated_at?: string;
}

export interface Exam {
  id?: number;
  title: string;
  course_id: number;
  questions?: ExamQuestion[];
  has_results?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id?: number;
  quiz_id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'a' | 'b' | 'c' | 'd';
  created_at?: string;
  updated_at?: string;
}

export interface ExamQuestion {
  id?: number;
  exam_id: number;
  question: string;
  correct_answer?: string; // Optional reference for teacher
  created_at?: string;
  updated_at?: string;
}

export interface QuizResult {
  id?: number;
  quiz_id?: number;
  student_id?: number;
  score: number;
  total: number;
  student?: {
    id: number;
    name: string;
    email: string;
  };
  created_at?: string;
}

export interface ExamResult {
  id: number;
  exam_id: number;
  student_id: number;
  score: number | null;
  student?: {
    id: number;
    name: string;
    email: string;
  };
  answers?: ExamAnswer[];
  created_at?: string;
}

export interface ExamAnswer {
  id: number;
  exam_result_id: number;
  question_id: number;
  answer: string;
  question?: ExamQuestion;
}

@Injectable({
  providedIn: 'root'
})
export class QuizExamService {
  private readonly baseUrl = API_CONFIG.baseUrl;
  private readonly quizUrl = `${this.baseUrl}/teacher/quiz`;
  private readonly examUrl = `${this.baseUrl}/teacher/exam`;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // ==================== QUIZ METHODS ====================
  
  getQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.quizUrl}?course_id=${courseId}`, {
      headers: this.getHeaders()
    });
  }

  createQuiz(quiz: Quiz): Observable<Quiz> {
    return this.http.post<Quiz>(this.quizUrl, quiz, {
      headers: this.getHeaders()
    });
  }

  getQuiz(id: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.quizUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateQuiz(id: number, quiz: Partial<Quiz>): Observable<Quiz> {
    return this.http.put<Quiz>(`${this.quizUrl}/${id}`, quiz, {
      headers: this.getHeaders()
    });
  }

  deleteQuiz(id: number): Observable<void> {
    return this.http.delete<void>(`${this.quizUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== QUIZ QUESTION METHODS ====================
  
  getQuizQuestions(quizId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.baseUrl}/teacher/question/quiz/${quizId}`, {
      headers: this.getHeaders()
    });
  }

  createQuizQuestion(quizId: number, question: QuizQuestion): Observable<QuizQuestion> {
    return this.http.post<QuizQuestion>(`${this.baseUrl}/teacher/question/quiz/${quizId}`, question, {
      headers: this.getHeaders()
    });
  }

  updateQuizQuestion(quizId: number, questionId: number, question: Partial<QuizQuestion>): Observable<QuizQuestion> {
    return this.http.put<QuizQuestion>(`${this.baseUrl}/teacher/question/quiz/${quizId}/${questionId}`, question, {
      headers: this.getHeaders()
    });
  }

  deleteQuizQuestion(quizId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teacher/question/quiz/${quizId}/${questionId}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== EXAM METHODS ====================
  
  getExamsByCourse(courseId: number): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.examUrl}?course_id=${courseId}`, {
      headers: this.getHeaders()
    });
  }

  createExam(exam: Exam): Observable<Exam> {
    return this.http.post<Exam>(this.examUrl, exam, {
      headers: this.getHeaders()
    });
  }

  getExam(id: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.examUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  updateExam(id: number, exam: Partial<Exam>): Observable<Exam> {
    return this.http.put<Exam>(`${this.examUrl}/${id}`, exam, {
      headers: this.getHeaders()
    });
  }

  deleteExam(id: number): Observable<void> {
    return this.http.delete<void>(`${this.examUrl}/${id}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== EXAM QUESTION METHODS ====================
  
  getExamQuestions(examId: number): Observable<ExamQuestion[]> {
    return this.http.get<ExamQuestion[]>(`${this.baseUrl}/teacher/question/exam/${examId}`, {
      headers: this.getHeaders()
    });
  }

  createExamQuestion(examId: number, question: ExamQuestion): Observable<ExamQuestion> {
    return this.http.post<ExamQuestion>(`${this.baseUrl}/teacher/question/exam/${examId}`, question, {
      headers: this.getHeaders()
    });
  }

  updateExamQuestion(examId: number, questionId: number, question: Partial<ExamQuestion>): Observable<ExamQuestion> {
    return this.http.put<ExamQuestion>(`${this.baseUrl}/teacher/question/exam/${examId}/${questionId}`, question, {
      headers: this.getHeaders()
    });
  }

  deleteExamQuestion(examId: number, questionId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/teacher/question/exam/${examId}/${questionId}`, {
      headers: this.getHeaders()
    });
  }

  // ==================== RESULTS METHODS ====================
  
  getQuizResults(quizId: number): Observable<QuizResult[]> {
    return this.http.get<QuizResult[]>(`${this.baseUrl}/teacher/quiz/${quizId}/results`, {
      headers: this.getHeaders()
    });
  }

  getExamResults(examId: number): Observable<ExamResult[]> {
    return this.http.get<ExamResult[]>(`${this.baseUrl}/teacher/exam/${examId}/results`, {
      headers: this.getHeaders()
    });
  }

  updateExamScore(examId: number, resultId: number, score: number): Observable<ExamResult> {
    return this.http.put<ExamResult>(`${this.baseUrl}/teacher/exam/${examId}/result/${resultId}/score`, { score }, {
      headers: this.getHeaders()
    });
  }

  // ==================== STUDENT METHODS ====================

  /**
   * Get all quizzes for a course (for students)
   */
  getStudentQuizzesByCourse(courseId: number): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.baseUrl}/student/course/${courseId}/quizzes`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get all exams for a course (for students)
   */
  getStudentExamsByCourse(courseId: number): Observable<Exam[]> {
    return this.http.get<Exam[]>(`${this.baseUrl}/student/course/${courseId}/exams`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Check if student has already taken a quiz
   */
  hasStudentTakenQuiz(quizId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/student/quiz/${quizId}/taken`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Check if student has already taken an exam
   */
  hasStudentTakenExam(examId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/student/exam/${examId}/taken`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get quiz details for students
   */
  getStudentQuiz(quizId: number): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.baseUrl}/student/quiz/${quizId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get quiz questions (for taking the quiz)
   */
  getStudentQuizQuestions(quizId: number): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.baseUrl}/student/quiz/${quizId}/questions`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get exam details for students
   */
  getStudentExam(examId: number): Observable<Exam> {
    return this.http.get<Exam>(`${this.baseUrl}/student/exam/${examId}`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get exam questions (for taking the exam)
   */
  getStudentExamQuestions(examId: number): Observable<ExamQuestion[]> {
    return this.http.get<ExamQuestion[]>(`${this.baseUrl}/student/exam/${examId}/questions`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Submit quiz answers and get score
   */
  submitQuiz(quizId: number, answers: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/student/quiz/${quizId}/submit`, { answers }, {
      headers: this.getHeaders()
    });
  }

  /**
   * Submit exam answers
   */
  submitExam(examId: number, answers: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/student/exam/${examId}/submit`, { answers }, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get student's quiz result
   */
  getStudentQuizResult(quizId: number): Observable<QuizResult> {
    return this.http.get<QuizResult>(`${this.baseUrl}/student/quiz/${quizId}/result`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get student's exam result
   */
  getStudentExamResult(examId: number): Observable<ExamResult> {
    return this.http.get<ExamResult>(`${this.baseUrl}/student/exam/${examId}/result`, {
      headers: this.getHeaders()
    });
  }

  /**
   * Get all student's results for a course
   */
  getStudentCourseResults(courseId: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/student/course/${courseId}/results`, {
      headers: this.getHeaders()
    });
  }
}

