import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { ClassService, Class } from '../../services/class.service';
import { CoursService, Cours } from '../../services/cours.service';

@Component({
  selector: 'app-classe-cours-etudiant',
  templateUrl: './classe-cours-etudiant.component.html',
  styleUrls: ['./classe-cours-etudiant.component.css']
})
export class ClasseCoursEtudiantComponent implements OnInit {
  classe: Class | null = null;
  cours: Cours[] = [];
  isLoading = true;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private classService: ClassService,
    private coursService: CoursService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadClasseAndCours();
  }

  loadClasseAndCours(): void {
    const classeId = this.route.snapshot.paramMap.get('id');
    if (!classeId) {
      this.isLoading = false;
      console.error('ID de la classe non trouvé dans l\'URL');
      return;
    }

    this.isLoading = true;
    
    // Load class details
    this.classService.getStudentClasses().subscribe({
      next: (classes) => {
        this.classe = classes.find(c => c.id === +classeId) || null;
        if (!this.classe) {
          this.isLoading = false;
          alert('Classe non trouvée ou vous n\'êtes pas inscrit dans cette classe');
          this.goBack();
          return;
        }
        
        // Load courses for this class
        this.loadCours();
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la classe:', error);
        this.isLoading = false;
        this.goBack();
      }
    });
  }

  loadCours(): void {
    const classeId = this.route.snapshot.paramMap.get('id');
    if (!classeId) return;

    this.classService.getClassCourses(+classeId).subscribe({
      next: (cours) => {
        this.cours = cours;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.cours = [];
        this.isLoading = false;
      }
    });
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

  navigateToCoursDetail(coursId?: number): void {
    if (!coursId) {
      return;
    }
    this.router.navigate(['/cours-detail-etud', coursId]);
  }

  goBack(): void {
    this.router.navigate(['/mes-cours-etudiant']);
  }
}

