import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';
import { LoginService } from '../../services/login.service';
import { QuizExamService, Quiz, Exam } from '@services/quiz-exam.service';
import { PostsService } from '@services/posts.service';

@Component({
  selector: 'app-cours-detail-etudiant',
  templateUrl: './cours-detail-etudiant.component.html',
  styleUrls: ['./cours-detail-etudiant.component.css']
})
export class CoursDetailEtudiantComponent implements OnInit {
  cours: Cours | null = null;
  isLoading = true;
  user: any;
  
  // Exams and Quizzes
  quizzes: Quiz[] = [];
  exams: Exam[] = [];
  loadingQuizzesExams = false;
  quizTakenStatus: { [key: number]: boolean } = {};
  examTakenStatus: { [key: number]: boolean } = {};
  quizScores: { [key: number]: any } = {};
  examScores: { [key: number]: any } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService,
    private loginService: LoginService,
    private quizExamService: QuizExamService,
    private postsService: PostsService
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadCoursDetail();
  }

  loadCoursDetail(): void {
    const coursId = this.route.snapshot.paramMap.get('id');
    if (!coursId) {
      this.isLoading = false;
      console.error('ID du cours non trouvé dans l\'URL');
      return;
    }

    this.isLoading = true;
    this.coursService.getCoursById(+coursId).subscribe({
      next: (cours) => {
        this.cours = cours;
        this.isLoading = false;
        // Load exams and quizzes after course is loaded
        this.loadQuizzesAndExams(+coursId);
        // Load posts for this course
        this.loadPosts(+coursId);
      },
      error: (error) => {
        console.error('Erreur lors du chargement du cours:', error);
        this.isLoading = false;
        alert(error.message || 'Erreur lors du chargement du cours');
      }
    });
  }

  loadQuizzesAndExams(courseId: number): void {
    this.loadingQuizzesExams = true;
    
    // Load quizzes
    this.quizExamService.getStudentQuizzesByCourse(courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        // Check which quizzes have been taken
        this.quizzes.forEach(quiz => this.checkQuizTaken(quiz.id!));
      },
      error: (error) => {
        console.error('Erreur lors du chargement des quizzes:', error);
        this.quizzes = [];
      }
    });

    // Load exams
    this.quizExamService.getStudentExamsByCourse(courseId).subscribe({
      next: (exams) => {
        this.exams = exams;
        // Check which exams have been taken
        this.exams.forEach(exam => this.checkExamTaken(exam.id!));
        this.loadingQuizzesExams = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des exams:', error);
        this.exams = [];
        this.loadingQuizzesExams = false;
      }
    });
  }

  checkQuizTaken(quizId: number): void {
    this.quizExamService.hasStudentTakenQuiz(quizId).subscribe({
      next: (taken) => {
        this.quizTakenStatus[quizId] = taken;
        if (taken) {
          // Load the score if already taken
          this.quizExamService.getStudentQuizResult(quizId).subscribe({
            next: (result) => {
              this.quizScores[quizId] = result;
            },
            error: (error) => console.error('Error loading quiz result:', error)
          });
        }
      },
      error: (error) => {
        console.error('Error checking quiz status:', error);
        this.quizTakenStatus[quizId] = false;
      }
    });
  }

  checkExamTaken(examId: number): void {
    this.quizExamService.hasStudentTakenExam(examId).subscribe({
      next: (taken) => {
        this.examTakenStatus[examId] = taken;
        if (taken) {
          // Load the score if already taken
          this.quizExamService.getStudentExamResult(examId).subscribe({
            next: (result) => {
              this.examScores[examId] = result;
            },
            error: (error) => console.error('Error loading exam result:', error)
          });
        }
      },
      error: (error) => {
        console.error('Error checking exam status:', error);
        this.examTakenStatus[examId] = false;
      }
    });
  }

  takeQuiz(quiz: Quiz): void {
    if (this.quizTakenStatus[quiz.id!]) {
      alert('Vous avez déjà réussi ce quiz. Vous ne pouvez le refaire qu\'une seule fois.');
      return;
    }
    // Navigate to quiz taking component/page
    this.router.navigate(['/take-quiz', quiz.id], { queryParams: { courseId: this.cours?.id } });
  }

  takeExam(exam: Exam): void {
    if (this.examTakenStatus[exam.id!]) {
      alert('Vous avez déjà passé cet examen. Vous ne pouvez le passer qu\'une seule fois.');
      return;
    }
    // Navigate to exam taking component/page
    this.router.navigate(['/take-exam', exam.id], { queryParams: { courseId: this.cours?.id } });
  }

  // Vérifie si l'utilisateur est inscrit au cours
  isEnrolled(): boolean {
    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    return enrollments.includes(this.cours?.id);
  }

  // S'inscrire au cours depuis la page détail
  enrollFromDetail(): void {
    if (!this.cours || this.cours.class_id) return; // Don't allow enrollment for class courses

    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    if (!enrollments.includes(this.cours.id)) {
      enrollments.push(this.cours.id);
      localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
      alert(`Félicitations ! Vous êtes maintenant inscrit au cours "${this.cours.title || this.cours.titre}"`);
      
      // Recharger la page pour mettre à jour l'interface
      this.loadCoursDetail();
    } else {
      alert('Vous êtes déjà inscrit à ce cours');
    }
  }

  // Se désinscrire du cours
  unenrollFromDetail(): void {
    if (!this.cours || this.cours.class_id) return; // Don't allow unenrollment for class courses

    if (confirm(`Êtes-vous sûr de vouloir vous désinscrire du cours "${this.cours.title || this.cours.titre}" ?`)) {
      const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
      const index = enrollments.indexOf(this.cours.id);
      if (index > -1) {
        enrollments.splice(index, 1);
        localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
        alert(`Vous avez été désinscrit du cours "${this.cours.title || this.cours.titre}"`);
        
        // Recharger la page pour mettre à jour l'interface
        this.loadCoursDetail();
      }
    }
  }

  // Obtenir la liste des supports normalisée
  getSupports(): string[] {
    if (!this.cours?.support) return [];
    
    if (Array.isArray(this.cours.support)) {
      return this.cours.support;
    }
    
    // Si c'est une string, la convertir en tableau
    return this.cours.support.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  // Télécharger un support
  downloadSupport(supportUrl: string): void {
    // Allow download for class courses or enrolled courses
    if (!this.cours?.class_id && !this.isEnrolled()) {
      alert('Vous devez vous inscrire au cours pour télécharger les supports.');
      return;
    }

    // Vérification de l'URL
    if (!this.isValidUrl(supportUrl)) {
      alert('Lien de support invalide');
      return;
    }

    // Ouvrir dans un nouvel onglet
    window.open(supportUrl, '_blank');
  }

  // Validation basique d'URL
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  // Obtenir le type de fichier
  getFileType(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.pdf')) return 'PDF';
    if (lowerUrl.match(/\.(mp4|avi|mov|wmv|mkv|flv)$/)) return 'Vidéo';
    if (lowerUrl.match(/\.(doc|docx)$/)) return 'Document Word';
    if (lowerUrl.match(/\.(ppt|pptx)$/)) return 'Présentation';
    if (lowerUrl.match(/\.(xls|xlsx)$/)) return 'Tableur Excel';
    if (lowerUrl.match(/\.(zip|rar|7z|tar|gz)$/)) return 'Archive';
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) return 'Image';
    if (lowerUrl.match(/\.(ipynb)$/)) return 'Notebook Python';
    
    return 'Fichier';
  }

  // Obtenir l'icône du fichier
  getFileIcon(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.pdf')) return 'fas fa-file-pdf';
    if (lowerUrl.match(/\.(mp4|avi|mov|wmv|mkv|flv)$/)) return 'fas fa-file-video';
    if (lowerUrl.match(/\.(doc|docx)$/)) return 'fas fa-file-word';
    if (lowerUrl.match(/\.(ppt|pptx)$/)) return 'fas fa-file-powerpoint';
    if (lowerUrl.match(/\.(xls|xlsx)$/)) return 'fas fa-file-excel';
    if (lowerUrl.match(/\.(zip|rar|7z|tar|gz)$/)) return 'fas fa-file-archive';
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) return 'fas fa-file-image';
    if (lowerUrl.match(/\.(ipynb)$/)) return 'fas fa-code';
    
    return 'fas fa-file';
  }

  // Obtenir le nom du fichier à partir de l'URL
  getFileName(url: string): string {
    try {
      return url.split('/').pop() || 'fichier';
    } catch {
      return 'fichier';
    }
  }

  // Formatage de date
  formatDate(date: any): string {
    if (!date) return 'Date non disponible';
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Date invalide';
      }
      
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Erreur de formatage de date:', error);
      return 'Date invalide';
    }
  }

  // Posts (Q&A)
  posts: any[] = [];
  newPostContent = '';

  loadPosts(courseId: number): void {
    this.postsService.getPosts(courseId).subscribe({ next: (p:any) => this.posts = p, error: e => console.error('Failed to load posts', e) });
  }

  submitPost(): void {
    if (!this.cours?.id) return;
    if (!this.newPostContent || this.newPostContent.trim().length === 0) return alert('Veuillez saisir un message');
    this.postsService.createPost(this.cours!.id as number, this.newPostContent).subscribe({ next: () => { this.newPostContent = ''; this.loadPosts(this.cours!.id as number); }, error: e => { console.error(e); alert('Erreur lors de l\'envoi du message') } });
  }

  // Navigation de retour
  goBack(): void {
    this.router.navigate(['/catalogue-cours']);
  }

  // Méthode utilitaire pour obtenir le nombre de supports
  getSupportsCount(): number {
    return this.getSupports().length;
  }

  // Vérifie s'il y a des supports
  hasSupports(): boolean {
    return this.getSupportsCount() > 0;
  }
}