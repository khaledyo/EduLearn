import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';

@Component({
  selector: 'app-catalogue-cours',
  templateUrl: './catalogue-cours.component.html',
  styleUrls: ['./catalogue-cours.component.css']
})
export class CatalogueCoursComponent implements OnInit {
  isLoading: boolean = false;
  coursDisponibles: Cours[] = [];
  searchTerm: string = ''; // variable pour la barre de recherche

  constructor(
    private router: Router,
    private coursService: CoursService
  ) {}

  ngOnInit(): void {
    this.loadCoursDisponibles();
  }

  loadCoursDisponibles(): void {
    this.isLoading = true;
    
    this.coursService.getTousLesCours().subscribe({
      next: (cours) => {
        this.coursDisponibles = cours;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours:', error);
        this.loadMockData();
        this.isLoading = false;
      }
    });
  }

  private loadMockData(): void {
    this.coursDisponibles = [
      {
        id: 1,
        title: 'Introduction à Angular',
        description: 'Maîtrisez le framework Angular pour développer des applications web modernes et performantes. Ce cours couvre les concepts fondamentaux et avancés avec des projets pratiques.',
        duration: 24,
        level: 'Débutant',
        created_at: new Date('2025-01-10'),
        teacher_id: 1,
        teacher_name: 'Dupont',
        teacher_first_name: 'Jean',
        support: 'https://example.com/angular-guide.pdf, https://example.com/angular-video.mp4'
      },
      {
        id: 2,
        title: 'Machine Learning Basics',
        description: 'Découvrez les bases du machine learning avec Python. Apprenez à implémenter des algorithmes et à créer vos premiers modèles prédictifs avec des datasets réels.',
        duration: 36,
        level: 'Intermédiaire',
        created_at: new Date('2025-01-15'),
        teacher_id: 2,
        teacher_name: 'Martin',
        teacher_first_name: 'Sophie',
        support: 'https://example.com/ml-basics.pdf, https://example.com/ml-dataset.zip'
      },
      {
        id: 3,
        title: 'Développement Web Full Stack',
        description: 'Devenez développeur full stack en maîtrisant le frontend et le backend. Technologies modernes incluant React, Node.js, MongoDB et deployment cloud.',
        level: 'Avancé',
        created_at: new Date('2025-01-20'),
        teacher_id: 1,
        teacher_name: 'Dupont',
        teacher_first_name: 'Jean',
        support: 'https://example.com/web-dev.pdf'
      },
      {
        id: 4,
        title: 'UI/UX Design Principles',
        description: 'Apprenez les principes fondamentaux du design d interface utilisateur et de l expérience utilisateur pour créer des applications intuitives et engageantes.',
        level: 'Débutant',
        created_at: new Date('2025-01-25'),
        teacher_id: 3,
        teacher_name: 'Bernard',
        teacher_first_name: 'Marie',
        support: 'https://example.com/uiux-guide.pdf, https://example.com/design-templates.zip'
      },
      {
        id: 5,
        title: 'Base de données avancées',
        description: 'Approfondissez vos connaissances en bases de données relationnelles et NoSQL. Optimisation, requêtes complexes, architectures distribuées et bonnes pratiques.',
        level: 'Intermédiaire',
        created_at: new Date('2025-02-01'),
        teacher_id: 2,
        teacher_name: 'Martin',
        teacher_first_name: 'Sophie',
        support: 'https://example.com/database-advanced.pdf'
      },
      {
        id: 6,
        title: 'Cybersécurité fondamentale',
        description: 'Protégez vos applications contre les menaces courantes. Concepts de sécurité, bonnes pratiques, outils de protection et techniques de sécurisation.',
        level: 'Tous',
        created_at: new Date('2025-02-05'),
        teacher_id: 3,
        teacher_name: 'Bernard',
        teacher_first_name: 'Marie',
        support: 'https://example.com/cybersecurity.pdf, https://example.com/security-tools.zip'
      }
    ];
  }

  // Retourne la liste filtrée en fonction du searchTerm
  get filteredCours(): Cours[] {
    if (!this.searchTerm) return this.coursDisponibles;
    const term = this.searchTerm.toLowerCase();
    return this.coursDisponibles.filter(c => (c.title || c.titre || '').toLowerCase().includes(term));
  }

  truncateDescription(description: string): string {
    const maxLength = 120;
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  }

  getCoursIcon(niveau: string): string {
    switch (niveau.toLowerCase()) {
      case 'débutant': return 'fas fa-seedling';
      case 'intermédiaire': return 'fas fa-chart-line';
      case 'avancé': return 'fas fa-rocket';
      default: return 'fas fa-graduation-cap';
    }
  }

  getEnseignantComplet(cours: Cours): string {
    const prenom = cours.teacher_first_name || cours.enseignantPrenom || '';
    const nom = cours.teacher_name || cours.enseignantNom || '';
    return `${prenom} ${nom}`.trim();
  }

  formatDate(date: Date | string | undefined): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getSupportsCount(cours: Cours): number {
    if (!cours.support) return 0;
    if (Array.isArray(cours.support)) return cours.support.length;
    return cours.support.split(',').filter(s => s.trim().length > 0).length;
  }

  voirCours(coursId: number): void {
    this.router.navigate(['/cours-detail-etud', coursId]);
  }

  enroll(courseId: number, cours: Cours): void {
    if (cours.class_id) return; // Don't allow enrollment for class courses
    
    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    if (!enrollments.includes(courseId)) {
      enrollments.push(courseId);
      localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
      this.showEnrollmentAnimation(courseId);
      alert(`Félicitations ! Vous êtes maintenant inscrit au cours "${cours.title || cours.titre}"`);
    } else {
      alert('Vous êtes déjà inscrit à ce cours');
    }
  }

  unenroll(courseId: number, cours: Cours): void {
    if (cours.class_id) return; // Don't allow unenrollment for class courses
    
    if (confirm(`Êtes-vous sûr de vouloir vous désinscrire du cours "${cours.title || cours.titre}" ?`)) {
      const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
      const index = enrollments.indexOf(courseId);
      if (index > -1) {
        enrollments.splice(index, 1);
        localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
        alert(`Vous avez été désinscrit du cours "${cours.title || cours.titre}"`);
      }
    }
  }

  toggleEnrollment(courseId: number, cours: Cours): void {
    if (this.isEnrolled(courseId)) {
      this.unenroll(courseId, cours);
      } else {
      this.enroll(courseId, cours);
    }
  }

  private showEnrollmentAnimation(coursId: number): void {
    const button = document.querySelector(`[data-cours-id="${coursId}"] .btn-primary`);
    if (button) {
      button.classList.add('enrollment-animation');
      setTimeout(() => button.classList.remove('enrollment-animation'), 1000);
    }
  }

  isEnrolled(coursId: number): boolean {
    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    return enrollments.includes(coursId);
  }
}
