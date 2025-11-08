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
        titre: 'Introduction à Angular',
        description: 'Maîtrisez le framework Angular pour développer des applications web modernes et performantes. Ce cours couvre les concepts fondamentaux et avancés avec des projets pratiques.',
        duree: 24,
        niveau: 'Débutant',
        dateCreation: new Date('2025-01-10'),
        enseignantId: 1,
        enseignantNom: 'Dupont',
        enseignantPrenom: 'Jean',
        support: 'https://example.com/angular-guide.pdf, https://example.com/angular-video.mp4'
      },
      {
        id: 2,
        titre: 'Machine Learning Basics',
        description: 'Découvrez les bases du machine learning avec Python. Apprenez à implémenter des algorithmes et à créer vos premiers modèles prédictifs avec des datasets réels.',
        duree: 36,
        niveau: 'Intermédiaire',
        dateCreation: new Date('2025-01-15'),
        enseignantId: 2,
        enseignantNom: 'Martin',
        enseignantPrenom: 'Sophie',
        support: 'https://example.com/ml-basics.pdf, https://example.com/ml-dataset.zip'
      },
      {
        id: 3,
        titre: 'Développement Web Full Stack',
        description: 'Devenez développeur full stack en maîtrisant le frontend et le backend. Technologies modernes incluant React, Node.js, MongoDB et deployment cloud.',
        niveau: 'Avancé',
        dateCreation: new Date('2025-01-20'),
        enseignantId: 1,
        enseignantNom: 'Dupont',
        enseignantPrenom: 'Jean',
        support: 'https://example.com/web-dev.pdf'
      },
      {
        id: 4,
        titre: 'UI/UX Design Principles',
        description: 'Apprenez les principes fondamentaux du design d interface utilisateur et de l expérience utilisateur pour créer des applications intuitives et engageantes.',
        niveau: 'Débutant',
        dateCreation: new Date('2025-01-25'),
        enseignantId: 3,
        enseignantNom: 'Bernard',
        enseignantPrenom: 'Marie',
        support: 'https://example.com/uiux-guide.pdf, https://example.com/design-templates.zip'
      },
      {
        id: 5,
        titre: 'Base de données avancées',
        description: 'Approfondissez vos connaissances en bases de données relationnelles et NoSQL. Optimisation, requêtes complexes, architectures distribuées et bonnes pratiques.',
        niveau: 'Intermédiaire',
        dateCreation: new Date('2025-02-01'),
        enseignantId: 2,
        enseignantNom: 'Martin',
        enseignantPrenom: 'Sophie',
        support: 'https://example.com/database-advanced.pdf'
      },
      {
        id: 6,
        titre: 'Cybersécurité fondamentale',
        description: 'Protégez vos applications contre les menaces courantes. Concepts de sécurité, bonnes pratiques, outils de protection et techniques de sécurisation.',
        niveau: 'Tous',
        dateCreation: new Date('2025-02-05'),
        enseignantId: 3,
        enseignantNom: 'Bernard',
        enseignantPrenom: 'Marie',
        support: 'https://example.com/cybersecurity.pdf, https://example.com/security-tools.zip'
      }
    ];
  }

  // Retourne la liste filtrée en fonction du searchTerm
  get filteredCours(): Cours[] {
    if (!this.searchTerm) return this.coursDisponibles;
    const term = this.searchTerm.toLowerCase();
    return this.coursDisponibles.filter(c => c.titre.toLowerCase().includes(term));
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
    return `${cours.enseignantPrenom} ${cours.enseignantNom}`;
  }

  formatDate(date: Date): string {
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

  enrollerCours(coursId: number): void {
    const cours = this.coursDisponibles.find(c => c.id === coursId);
    if (cours) {
      const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
      if (!enrollments.includes(coursId)) {
        enrollments.push(coursId);
        localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
        this.showEnrollmentAnimation(coursId);
        alert(`Félicitations ! Vous êtes maintenant inscrit au cours "${cours.titre}"`);
      } else {
        alert('Vous êtes déjà inscrit à ce cours');
      }
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
