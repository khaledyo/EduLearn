import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';
import { LoginService } from '../../services/login.service';
import { QuizExamService, Quiz, Exam, QuizResult, ExamResult } from '../../services/quiz-exam.service';

@Component({
  selector: 'app-consultation-cours-ens',
  templateUrl: './consultation-cours-ens.component.html',
  styleUrls: ['./consultation-cours-ens.component.css']
})
export class ConsultationCoursEnsComponent implements OnInit {
  coursList: Cours[] = [];
  coursFiltres: Cours[] = [];
  showCoursModal = false;
  showDeleteModal = false;
  isEditMode = false;
  isLoading = false;
  currentCours: Cours | null = null;
  coursToDelete: { id: number, titre: string } | null = null;
  user: any;
  searchTerm: string = '';
  
  // Exams and Quizzes properties
  selectedCoursForResults: Cours | null = null;
  showResultsModal = false;
  quizzes: Quiz[] = [];
  exams: Exam[] = [];
  quizResults: { [key: number]: QuizResult[] } = {};
  examResults: { [key: number]: ExamResult[] } = {};
  loadingResults = false;
  selectedResultTab: 'quizzes' | 'exams' = 'quizzes';

  constructor(
    private coursService: CoursService,
    private loginService: LoginService,
    private router: Router,
    private quizExamService: QuizExamService
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadCours();
  }

  loadCours(): void {
    this.isLoading = true;

    // Utilisation du service pour charger les cours de l'enseignant
    const enseignantId = this.getEnseignantId();
    
    this.coursService.getCoursByEnseignant(enseignantId).subscribe({
      next: (cours) => {
        this.coursList = cours;
        this.coursFiltres = [...cours]; // Initialiser les cours filtrés
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        
        // Fallback: données mockées en cas d'erreur
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  // Données mockées en fallback
  private loadMockData(): void {
    this.coursList = [
      {
        id: 1,
        title: 'Introduction à Angular',
        description: 'Apprenez les bases du framework Angular, y compris les composants, les templates et la gestion des données.',
        support: ['https://example.com/angular-guide.pdf', 'https://example.com/angular-guide.mp4'],
        created_at: new Date('2025-01-10'),
        teacher_id: this.getEnseignantId(),
        duration: 24,
        level: 'Débutant'
      },
      {
        id: 2,
        title: 'Programmation Orientée Objet en Java',
        description: 'Comprendre les principes fondamentaux de la POO en Java : classes, héritage, encapsulation et polymorphisme.',
        support: ['https://example.com/java-poo.pdf', 'https://example.com/java-poo.pdf.mp4'],
        created_at: new Date('2025-02-03'),
        teacher_id: this.getEnseignantId(),
        duration: 30,
        level: 'Intermédiaire'
      },
      {
        id: 3,
        title: 'Développement Web avec Spring Boot',
        description: 'Découvrez comment créer des applications web robustes avec Spring Boot, REST API et JPA.',
        support: 'https://example.com/spring-boot.pdf',
        created_at: new Date('2025-03-15'),
        teacher_id: this.getEnseignantId(),
        duration: 36,
        level: 'Avancé'
      },
      {
        id: 4,
        title: 'Bases de Données MySQL',
        description: 'Introduction à la modélisation, aux requêtes SQL et à l\'optimisation dans MySQL.',
        support: 'https://example.com/mysql-guide.pdf',
        created_at: new Date('2025-04-05'),
        teacher_id: this.getEnseignantId(),
        duration: 20,
        level: 'Débutant'
      },
      {
        id: 5,
        title: 'HTML, CSS et JavaScript Modernes',
        description: 'Apprenez à créer des interfaces web interactives avec HTML5, CSS3 et JavaScript ES6.',
        support: 'https://example.com/frontend-course.pdf',
        created_at: new Date(),
        teacher_id: this.getEnseignantId(),
        duration: 28,
        level: 'Débutant'
      }
    ];
    this.coursFiltres = [...this.coursList];
  }

  // Filtrer les cours localement par titre
  filtrerCoursParTitre(): void {
    if (!this.searchTerm.trim()) {
      this.coursFiltres = [...this.coursList];
      return;
    }

    const terme = this.searchTerm.toLowerCase().trim();
    this.coursFiltres = this.coursList.filter(cours =>
      (cours.title || cours.titre || '').toLowerCase().includes(terme)
    );
  }

  // Recherche en temps réel
  onSearchChange(): void {
    this.filtrerCoursParTitre();
  }

  // Recherche avec le service (optionnel)
  rechercherCours(): void {
    if (this.searchTerm.trim()) {
      this.coursService.rechercherCours(this.getEnseignantId(), this.searchTerm).subscribe({
        next: (resultats) => {
          this.coursFiltres = resultats;
        },
        error: (error) => {
          console.error('Erreur lors de la recherche:', error);
          // Fallback: recherche locale
          this.filtrerCoursParTitre();
        }
      });
    } else {
      this.coursFiltres = [...this.coursList];
    }
  }

  // Effacer la recherche
  clearSearch(): void {
    this.searchTerm = '';
    this.coursFiltres = [...this.coursList];
  }

  // Obtenir les cours filtrés pour l'affichage
  getCoursFiltres(): Cours[] {
    return this.coursFiltres;
  }

  getEnseignantId(): number {
    if (this.user?.id) {
      return this.user.id;
    }
    
    // Fallback vers localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.id || 0;
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    }
    return 0;
  }

  openAddModal(): void {
    this.currentCours = {
      title: '',
      description: '',
      teacher_id: this.getEnseignantId(),
      duration: 0,
      level: 'Débutant'
    } as Cours;
    this.isEditMode = false;
    this.showCoursModal = true;
  }

  openEditModal(cours: Cours): void {
    this.currentCours = { ...cours };
    this.isEditMode = true;
    this.showCoursModal = true;
  }

  closeCoursModal(): void {
    this.showCoursModal = false;
    this.currentCours = null;
  }

  handleCoursSubmit(coursData: any): void {
    if (this.isEditMode && coursData.id) {
      // Mise à jour d'un cours existant
      this.coursService.updateCours(coursData.id, coursData).subscribe({
        next: (updatedCours) => {
          // Mettre à jour la liste localement
          const index = this.coursList.findIndex(c => c.id === updatedCours.id);
          if (index !== -1) {
            this.coursList[index] = updatedCours;
          }
          this.filtrerCoursParTitre(); // Re-filtrer après mise à jour
          this.closeCoursModal();
          alert('Cours modifié avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          alert(error.message || 'Erreur lors de la modification du cours');
        }
      });
    } else {
      // Création d'un nouveau cours
      // Extract files from coursData
      const files = coursData.files || [];
      const courseWithoutFiles = { ...coursData };
      delete courseWithoutFiles.files;
      
      const nouveauCours: Cours = {
        ...courseWithoutFiles,
        teacher_id: this.getEnseignantId(),
        created_at: new Date()
      };

      this.coursService.createCours(nouveauCours, undefined, files).subscribe({
        next: (coursCree) => {
          this.coursList.unshift(coursCree); // Ajouter au début de la liste
          this.filtrerCoursParTitre(); // Re-filtrer après ajout
          this.closeCoursModal();
          alert('Cours ajouté avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          alert(error.message || 'Erreur lors de la création du cours');
        }
      });
    }
  }

  handleFileChange(file: File): void {
    if (file) {
      this.coursService.uploadFile(file).subscribe({
        next: (response) => {
          console.log('Fichier uploadé avec succès:', response);
          // Ajouter le fichier uploadé aux supports du cours courant
          if (this.currentCours) {
            const supports = Array.isArray(this.currentCours.support) 
              ? this.currentCours.support 
              : this.currentCours.support?.split(',').map(s => s.trim()) || [];
            
            supports.push(response.filePath);
            this.currentCours.support = supports;
          }
        },
        error: (error) => {
          console.error('Erreur lors de l\'upload:', error);
          alert('Erreur lors de l\'upload du fichier');
        }
      });
    }
  }

  openDeleteModal(cours: Cours): void {
    this.coursToDelete = {
      id: cours.id!,
      titre: cours.title || cours.titre || ''
    };
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.coursToDelete = null;
  }

  handleDeleteConfirm(): void {
    if (this.coursToDelete) {
      this.coursService.deleteCours(this.coursToDelete.id).subscribe({
        next: () => {
          // Supprimer de la liste localement
          this.coursList = this.coursList.filter(c => c.id !== this.coursToDelete?.id);
          this.filtrerCoursParTitre(); // Re-filtrer après suppression
          this.closeDeleteModal();
          alert('Cours supprimé avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert(error.message || 'Erreur lors de la suppression du cours');
        }
      });
    }
  }

  navigateToCoursDetail(coursId: number): void {
    this.router.navigate(['/cours', coursId]);
  }

  formatDate(date: any): string {
    if (!date) return 'Date non disponible';
    try {
      const dateObj = new Date(date);
      return dateObj.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'Date invalide';
    }
  }

  // Obtenir le nombre de supports pour un cours
  getSupportsCount(cours: Cours): number {
    if (!cours.support) return 0;
    
    if (Array.isArray(cours.support)) {
      return cours.support.length;
    }
    
    return cours.support.split(',').filter(s => s.trim().length > 0).length;
  }

  // ==================== RESULTS MANAGEMENT ====================

  openResultsModal(cours: Cours): void {
    this.selectedCoursForResults = cours;
    this.showResultsModal = true;
    this.loadResultsData(cours.id!);
  }

  closeResultsModal(): void {
    this.showResultsModal = false;
    this.selectedCoursForResults = null;
    this.quizzes = [];
    this.exams = [];
    this.quizResults = {};
    this.examResults = {};
  }

  loadResultsData(courseId: number): void {
    this.loadingResults = true;
    
    // Load quizzes
    this.quizExamService.getQuizzesByCourse(courseId).subscribe({
      next: (quizzes) => {
        this.quizzes = quizzes;
        // Load results for each quiz
        this.quizzes.forEach(quiz => {
          this.quizExamService.getQuizResults(quiz.id!).subscribe({
            next: (results) => {
              this.quizResults[quiz.id!] = results;
            },
            error: (error) => {
              console.error(`Error loading results for quiz ${quiz.id}:`, error);
              this.quizResults[quiz.id!] = [];
            }
          });
        });
      },
      error: (error) => {
        console.error('Error loading quizzes:', error);
        this.quizzes = [];
      }
    });

    // Load exams
    this.quizExamService.getExamsByCourse(courseId).subscribe({
      next: (exams) => {
        this.exams = exams;
        // Load results for each exam
        this.exams.forEach(exam => {
          this.quizExamService.getExamResults(exam.id!).subscribe({
            next: (results) => {
              this.examResults[exam.id!] = results;
            },
            error: (error) => {
              console.error(`Error loading results for exam ${exam.id}:`, error);
              this.examResults[exam.id!] = [];
            }
          });
        });
        this.loadingResults = false;
      },
      error: (error) => {
        console.error('Error loading exams:', error);
        this.exams = [];
        this.loadingResults = false;
      }
    });
  }

  getQuizResultsForQuiz(quizId: number): QuizResult[] {
    return this.quizResults[quizId] || [];
  }

  getExamResultsForExam(examId: number): ExamResult[] {
    return this.examResults[examId] || [];
  }

  updateExamScore(exam: Exam, result: ExamResult, newScore: number): void {
    if (newScore < 0) {
      alert('Le score ne peut pas être négatif');
      return;
    }

    this.quizExamService.updateExamScore(exam.id!, result.id, newScore).subscribe({
      next: (updatedResult) => {
        // Update the result in the list
        const results = this.examResults[exam.id!];
        const index = results.findIndex(r => r.id === result.id);
        if (index !== -1) {
          results[index] = updatedResult;
        }
        alert('Score mis à jour avec succès');
      },
      error: (error) => {
        console.error('Error updating exam score:', error);
        alert('Erreur lors de la mise à jour du score');
      }
    });
  }

  viewExamAnswers(result: ExamResult): void {
    // Navigate to answer review page
    this.router.navigate(['/exam-answer-review', result.id]);
  }

  // Navigate to exam grading list
  gradeExam(exam: Exam): void {
    this.closeResultsModal();
    this.router.navigate(['/exam-grading-list', exam.id]);
  }

}