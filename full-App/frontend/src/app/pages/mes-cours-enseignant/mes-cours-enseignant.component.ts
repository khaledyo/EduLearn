import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CoursService, Cours } from 'src/app/services/cours.service';
import { ClassService, Class } from 'src/app/services/class.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mes-cours-enseignant',
  templateUrl: './mes-cours-enseignant.component.html',
  styleUrls: ['./mes-cours-enseignant.component.css']
})
export class MesCoursEnseignantComponent implements OnInit {
  user: any;
  stats: { coursCrees: number; etudiantsTotal: number; messagesNonLus: number } = {
    coursCrees: 0,
    etudiantsTotal: 0,
    messagesNonLus: 0
  };
  coursRecents: Cours[] = [];
  classes: Class[] = [];
  classesRecentes: Class[] = [];
  isLoading = false;
  showClassModal = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private coursService: CoursService,
    private classService: ClassService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadCoursRecents();
    this.loadClasses(); // Load classes first, then stats will be updated
  }

  loadStats() {
    const enseignantId = this.loginService.getUserId();
    if (!enseignantId) {
      this.stats = { coursCrees: 0, etudiantsTotal: 0, messagesNonLus: 0 };
      return;
    }

    this.isLoading = true;
    this.coursService.getCoursByEnseignant(enseignantId).subscribe({
      next: (cours) => {
        // Calculate total students from all classes
        const totalStudents = this.classes.reduce((sum, classe) => {
          return sum + (classe.students_count || 0);
        }, 0);

    this.stats = {
          coursCrees: cours.length,
          etudiantsTotal: totalStudents,
          messagesNonLus: 0  // TODO: connecter à une API dédiée si disponible
        };
        this.isLoading = false;
      },
      error: (error) => {
        // Service already handles 500 errors gracefully, but just in case
        this.stats = { coursCrees: 0, etudiantsTotal: 0, messagesNonLus: 0 };
        this.isLoading = false;
      }
    });
  }

  loadClasses() {
    this.classService.getMyClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        // Get recent classes (last 3, sorted by creation date)
        this.classesRecentes = classes
          .sort((a, b) => {
            const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
            const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 3);
        // Load stats after classes are loaded
        this.loadStats();
      },
      error: (error) => {
        // Service already handles 500 errors gracefully, but just in case
        this.classes = [];
        this.classesRecentes = [];
        // Still load stats even if classes fail
        this.loadStats();
      }
    });
  }

loadCoursRecents() {
    const enseignantId = this.loginService.getUserId();
    if (!enseignantId) {
      this.coursRecents = [];
      return;
    }

  this.coursService.getCoursRecents(enseignantId).subscribe({
      next: (cours) => {
      this.coursRecents = cours;
    },
      error: (error) => {
        // Service already handles 500 errors gracefully, but just in case
        this.coursRecents = [];
    }
  });
}

  // loadCoursRecents() {
  //   // Données simulées des cours récents
  //   this.coursRecents = [
  //     {
  //       id: 1,
  //       idEnseignant: localStorage['id'], // Correction : remplacé = par :
  //       titre: 'Introduction à Angular',
  //       description: 'Découverte des concepts fondamentaux',
  //       datePublication: new Date('2024-01-15'),
  //       estPublie: true
  //     },
  //     {
  //       id: 2,
  //       idEnseignant: localStorage['id'], // Ajout de la propriété manquante
  //       titre: 'TypeScript Avancé',
  //       description: 'Maîtrise des concepts avancés',
  //       datePublication: new Date('2024-01-20'),
  //       estPublie: true
  //     }
  //   ];
  // }

  naviguerVersMesCours() {
    this.router.navigate(['/enseignant/mes-cours']);
  }

  creerNouveauCours() {
    this.router.navigate(['/enseignant/nouveau-cours']);
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  naviguerVersDetailCours(coursId?: number) {
    if (!coursId) {
      return;
    }
    this.router.navigate(['/cours', coursId]);
  }

  naviguerVersMesClasses() {
    this.router.navigate(['/enseignant/mes-classes']);
  }

  naviguerVersDetailClasse(classId?: number) {
    if (!classId) {
      return;
    }
    this.router.navigate(['/enseignant/classe', classId]);
  }

  openClassModal() {
    this.showClassModal = true;
  }

  closeClassModal() {
    this.showClassModal = false;
  }

  handleClassSubmit(classData: any) {
    this.classService.createClass(classData).subscribe({
      next: (newClass) => {
        this.showMessage('Classe créée avec succès !', 'success');
        this.classes.unshift(newClass);
        this.loadStats(); // Update stats with new student count
        this.closeClassModal();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la classe:', error);
        this.showMessage(error.message || 'Erreur lors de la création de la classe', 'error');
      }
    });
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