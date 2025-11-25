import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClassService, Class } from '../../services/class.service';
import { LoginService } from '../../services/login.service';
import { CoursService, Cours } from '../../services/cours.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-classe-detail',
  templateUrl: './classe-detail.component.html',
  styleUrls: ['./classe-detail.component.css']
})
export class ClasseDetailComponent implements OnInit {
  classe: Class | null = null;
  students: any[] = [];
  courses: Cours[] = [];
  isLoading = true;
  isLoadingStudents = false;
  isLoadingCourses = false;
  user: any;
  isTeacher: boolean = false;
  showInviteModal = false;
  showEditModal = false;
  showDeleteModal = false;
  showCreateCourseModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private loginService: LoginService,
    private coursService: CoursService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.isTeacher = this.user?.role === 'teacher' || this.user?.role === 'enseignant';
    this.loadClasseDetail();
  }

  loadClasseDetail(): void {
    const classeId = this.route.snapshot.paramMap.get('id');
    if (!classeId) {
      this.isLoading = false;
      console.error('ID de la classe non trouvé dans l\'URL');
      return;
    }

    this.isLoading = true;
    this.classService.getClassById(+classeId).subscribe({
      next: (classe) => {
        this.classe = classe;
        this.isLoading = false;
        if (this.isTeacher) {
          this.loadStudents();
          this.loadCourses();
        }
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la classe:', error);
        this.isLoading = false;
        this.showMessage(error.message || 'Erreur lors du chargement de la classe', 'error');
      }
    });
  }

  loadStudents(): void {
    if (!this.classe?.id) return;

    this.isLoadingStudents = true;
    this.classService.getClassStudents(this.classe.id).subscribe({
      next: (students) => {
        this.students = students;
        this.isLoadingStudents = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des étudiants:', error);
        this.students = [];
        this.isLoadingStudents = false;
        // Don't show error message for students, just log it
      }
    });
  }

  formatDate(date: string | Date | undefined): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  removeStudent(studentId: number, studentName?: string): void {
    if (!this.classe?.id) return;

    const confirmMessage = `Êtes-vous sûr de vouloir retirer ${studentName || 'cet étudiant'} de cette classe ?`;
    if (!confirm(confirmMessage)) {
      return;
    }

    this.classService.removeStudent(this.classe.id, studentId).subscribe({
      next: () => {
        this.showMessage('Étudiant retiré de la classe avec succès', 'success');
        this.loadStudents();
        // Reload class to update student count
        this.loadClasseDetail();
      },
      error: (error) => {
        console.error('Erreur lors du retrait de l\'étudiant:', error);
        this.showMessage(error.message || 'Erreur lors du retrait de l\'étudiant', 'error');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/enseignant/mes-classes']);
  }

  openInviteModal(): void {
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
  }

  handleStudentAdded(student: any): void {
    this.showMessage('Étudiant ajouté à la classe avec succès', 'success');
    this.loadStudents();
    this.loadClasseDetail(); // Reload to update student count
  }

  openEditModal(): void {
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
  }

  handleClassUpdate(classData: any): void {
    if (!this.classe?.id) return;

    this.classService.updateClass(this.classe.id, classData).subscribe({
      next: (updatedClass) => {
        this.showMessage('Classe modifiée avec succès', 'success');
        this.classe = updatedClass;
        this.closeEditModal();
      },
      error: (error) => {
        console.error('Erreur lors de la modification de la classe:', error);
        this.showMessage(error.message || 'Erreur lors de la modification de la classe', 'error');
      }
    });
  }

  openDeleteModal(): void {
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  handleDeleteConfirm(): void {
    if (!this.classe?.id) return;

    this.classService.deleteClass(this.classe.id).subscribe({
      next: () => {
        this.showMessage('Classe supprimée avec succès', 'success');
        this.router.navigate(['/enseignant/mes-classes']);
      },
      error: (error) => {
        console.error('Erreur lors de la suppression de la classe:', error);
        this.showMessage(error.message || 'Erreur lors de la suppression de la classe', 'error');
        this.closeDeleteModal();
      }
    });
  }

  openCreateCourseModal(): void {
    this.showCreateCourseModal = true;
  }

  closeCreateCourseModal(): void {
    this.showCreateCourseModal = false;
  }

  loadCourses(): void {
    if (!this.classe?.id) return;
    
    this.isLoadingCourses = true;
    this.classService.getClassCoursesForTeacher(this.classe.id).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoadingCourses = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.courses = [];
        this.isLoadingCourses = false;
      }
    });
  }

  handleCourseCreate(coursData: any): void {
    if (!this.classe?.id) return;

    // Extract files from coursData
    const files = coursData.files || [];
    const courseWithoutFiles = { ...coursData };
    delete courseWithoutFiles.files;

    // Add class_id to the course data
    const courseWithClass = {
      ...courseWithoutFiles,
      class_id: this.classe.id
    };

    this.coursService.createCours(courseWithClass, this.classe.id, files).subscribe({
      next: () => {
        this.showMessage('Cours créé avec succès pour cette classe', 'success');
        this.closeCreateCourseModal();
        this.loadCourses(); // Reload courses list
      },
      error: (error) => {
        console.error('Erreur lors de la création du cours:', error);
        this.showMessage(error.message || 'Erreur lors de la création du cours', 'error');
      }
    });
  }

  navigateToCoursDetail(coursId?: number): void {
    if (!coursId) return;
    this.router.navigate(['/cours', coursId]);
  }

  showMessage(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Fermer', {
      duration: 3500,
      panelClass: type === 'success' ? ['success-snackbar'] : ['error-snackbar'],
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}

