import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ClassService, Class } from 'src/app/services/class.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-mes-classes-enseignant',
  templateUrl: './mes-classes-enseignant.component.html',
  styleUrls: ['./mes-classes-enseignant.component.css']
})
export class MesClassesEnseignantComponent implements OnInit {
  user: any;
  classes: Class[] = [];
  isLoading = false;
  showClassModal = false;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private classService: ClassService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadClasses();
  }

  loadClasses() {
    this.isLoading = true;
    this.classService.getMyClasses().subscribe({
      next: (classes) => {
        this.classes = classes;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.classes = [];
        this.isLoading = false;
        this.showMessage('Erreur lors du chargement des classes', 'error');
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

  openClassModal() {
    this.showClassModal = true;
  }

  closeClassModal() {
    this.showClassModal = false;
  }

  handleClassSubmit(classData: any) {
    this.classService.createClass(classData).subscribe({
      next: (newClass) => {
        this.showMessage('Votre demande de classe a été soumise pour approbation de l\'administrateur !', 'success');
        this.loadClasses();
        this.closeClassModal();
      },
      error: (error) => {
        console.error('Erreur lors de la création de la classe:', error);
        this.showMessage(error.message || 'Erreur lors de la création de la classe', 'error');
      }
    });
  }

  navigateToClassDetail(classId?: number) {
    if (!classId) {
      return;
    }
    this.router.navigate(['/enseignant/classe', classId]);
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

