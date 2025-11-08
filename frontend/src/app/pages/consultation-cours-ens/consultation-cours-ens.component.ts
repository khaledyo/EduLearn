import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';
import { LoginService } from '../../services/login.service';

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

  constructor(
    private coursService: CoursService,
    private loginService: LoginService,
    private router: Router
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
        titre: 'Introduction à Angular',
        description: 'Apprenez les bases du framework Angular, y compris les composants, les templates et la gestion des données.',
        support: ['https://example.com/angular-guide.pdf', 'https://example.com/angular-guide.mp4'],
        dateCreation: new Date('2025-01-10'),
        enseignantId: this.getEnseignantId(),
        duree: 24,
        niveau: 'Débutant'
      },
      {
        id: 2,
        titre: 'Programmation Orientée Objet en Java',
        description: 'Comprendre les principes fondamentaux de la POO en Java : classes, héritage, encapsulation et polymorphisme.',
        support: ['https://example.com/java-poo.pdf', 'https://example.com/java-poo.pdf.mp4'],
        dateCreation: new Date('2025-02-03'),
        enseignantId: this.getEnseignantId(),
        duree: 30,
        niveau: 'Intermédiaire'
      },
      {
        id: 3,
        titre: 'Développement Web avec Spring Boot',
        description: 'Découvrez comment créer des applications web robustes avec Spring Boot, REST API et JPA.',
        support: 'https://example.com/spring-boot.pdf',
        dateCreation: new Date('2025-03-15'),
        enseignantId: this.getEnseignantId(),
        duree: 36,
        niveau: 'Avancé'
      },
      {
        id: 4,
        titre: 'Bases de Données MySQL',
        description: 'Introduction à la modélisation, aux requêtes SQL et à l\'optimisation dans MySQL.',
        support: 'https://example.com/mysql-guide.pdf',
        dateCreation: new Date('2025-04-05'),
        enseignantId: this.getEnseignantId(),
        duree: 20,
        niveau: 'Débutant'
      },
      {
        id: 5,
        titre: 'HTML, CSS et JavaScript Modernes',
        description: 'Apprenez à créer des interfaces web interactives avec HTML5, CSS3 et JavaScript ES6.',
        support: 'https://example.com/frontend-course.pdf',
        dateCreation: new Date(),
        enseignantId: this.getEnseignantId(),
        duree: 28,
        niveau: 'Débutant'
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
      cours.titre.toLowerCase().includes(terme)
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
      titre: '',
      description: '',
      enseignantId: this.getEnseignantId(),
      duree: 0,
      niveau: 'Débutant'
    };
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
      const nouveauCours: Cours = {
        ...coursData,
        enseignantId: this.getEnseignantId(),
        dateCreation: new Date()
      };

      this.coursService.createCours(nouveauCours).subscribe({
        next: (coursCree) => {
          this.coursList.unshift(coursCree); // Ajouter au début de la liste
          this.filtrerCoursParTitre(); // Re-filtrer après ajout
          this.closeCoursModal();
          alert('Cours créé avec succès');
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
      titre: cours.titre
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

}