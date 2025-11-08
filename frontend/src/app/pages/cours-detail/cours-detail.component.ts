import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-cours-detail',
  templateUrl: './cours-detail.component.html',
  styleUrls: ['./cours-detail.component.css']
})
export class CoursDetailComponent implements OnInit {
  cours: Cours | null = null;
  isLoading = true;
  showEditModal = false;
  showDeleteModal = false;
  user: any;
  isEnseignant: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.isEnseignant = this.user?.role === 'enseignant';
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
      },
      error: (error) => {
        console.error('Erreur lors du chargement du cours:', error);
        this.isLoading = false;
        alert(error.message || 'Erreur lors du chargement du cours');
      }
    });
  }

  // ✅ CORRECTION : Normaliser les supports pour toujours retourner un tableau
  getSupports(): string[] {
    if (!this.cours?.support) return [];
    
    if (Array.isArray(this.cours.support)) {
      return this.cours.support;
    }
    
    // Si c'est une string, la convertir en tableau
    return this.cours.support.split(',').map(s => s.trim()).filter(s => s.length > 0);
  }

  // Vérifie si l'utilisateur est inscrit au cours (pour les étudiants)
  isEnrolled(): boolean {
    if (this.isEnseignant) return true;
    
    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    return enrollments.includes(this.cours?.id);
  }

  // Inscription au cours (pour les étudiants)
  enrollCours(): void {
    if (!this.cours) return;

    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    if (!enrollments.includes(this.cours.id)) {
      enrollments.push(this.cours.id);
      localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
      alert(`Félicitations ! Vous êtes maintenant inscrit au cours "${this.cours.titre}"`);
    } else {
      alert('Vous êtes déjà inscrit à ce cours');
    }
  }

  getUserName(): string {
    if (this.user) {
      return `${this.user.prenom} ${this.user.nom}`;
    }
    
    // Fallback vers localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return `${user.prenom} ${user.nom}`;
      } catch (error) {
        console.error('Erreur lors du parsing des données utilisateur:', error);
      }
    }
    return 'Utilisateur';
  }

  downloadSupport(supportUrl: string): void {
    if (!this.canDownload()) {
      alert('Vous devez vous inscrire au cours pour télécharger les supports.');
      return;
    }

    // Vérification de l'URL
    if (!this.isValidUrl(supportUrl)) {
      alert('Lien de support invalide');
      return;
    }

    window.open(supportUrl, '_blank');
  }

  // Vérifie si l'utilisateur peut télécharger
  private canDownload(): boolean {
    return this.isEnseignant || this.isEnrolled();
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

  getFileName(url: string): string {
    try {
      return url.split('/').pop() || 'fichier';
    } catch {
      return 'fichier';
    }
  }

  getFileColor(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('.pdf')) return '#e74c3c';
    if (lowerUrl.match(/\.(mp4|avi|mov|wmv|mkv|flv)$/)) return '#9b59b6';
    if (lowerUrl.match(/\.(doc|docx)$/)) return '#2c81ba';
    if (lowerUrl.match(/\.(ppt|pptx)$/)) return '#d35400';
    if (lowerUrl.match(/\.(xls|xlsx)$/)) return '#27ae60';
    if (lowerUrl.match(/\.(zip|rar|7z|tar|gz)$/)) return '#f39c12';
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) return '#e74c3c';
    if (lowerUrl.match(/\.(ipynb)$/)) return '#e67e22';
    
    return '#7f8c8d';
  }

  getCoursIcon(): string {
    if (!this.cours) return 'fas fa-book';
    
    const lowerTitre = this.cours.titre.toLowerCase();
    if (lowerTitre.includes('angular') || lowerTitre.includes('programmation')) return 'fas fa-code';
    if (lowerTitre.includes('machine') || lowerTitre.includes('ai') || lowerTitre.includes('intelligence')) return 'fas fa-robot';
    if (lowerTitre.includes('web') || lowerTitre.includes('développement')) return 'fas fa-laptop-code';
    if (lowerTitre.includes('design') || lowerTitre.includes('ui/ux')) return 'fas fa-palette';
    if (lowerTitre.includes('base de données') || lowerTitre.includes('database')) return 'fas fa-database';
    if (lowerTitre.includes('cybersécurité') || lowerTitre.includes('security')) return 'fas fa-shield-alt';
    if (lowerTitre.includes('math')) return 'fas fa-calculator';
    
    return 'fas fa-book';
  }

  // Modal d'édition (enseignants seulement)
  openEditModal(): void {
    if (this.isEnseignant) {
      this.showEditModal = true;
    } else {
      console.warn('Modification désactivée pour les étudiants');
    }
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.loadCoursDetail(); // Recharger les données après modification
  }

  handleCoursSubmit(coursData: any): void {
    if (this.cours?.id && this.isEnseignant) {
      this.coursService.updateCours(this.cours.id, coursData).subscribe({
        next: () => {
          this.loadCoursDetail();
          this.closeEditModal();
          alert('Cours modifié avec succès');
        },
        error: (error) => {
          console.error('Erreur lors de la modification:', error);
          alert(error.message || 'Erreur lors de la modification du cours');
        }
      });
    }
  }

  handleFileChange(file: File): void {
    if (this.isEnseignant) {
      console.log('Fichier sélectionné pour upload:', file);
      // Implémenter l'upload ici si nécessaire
    }
  }

  // Modal de suppression (enseignants seulement)
  openDeleteModal(): void {
    if (this.isEnseignant) {
      this.showDeleteModal = true;
    } else {
      console.warn('Suppression désactivée pour les étudiants');
    }
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  handleDeleteConfirm(): void {
    if (this.cours?.id && this.isEnseignant) {
      this.coursService.deleteCours(this.cours.id).subscribe({
        next: () => {
          alert('Cours supprimé avec succès');
          this.router.navigate(['/enseignant/mes-cours']);
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          alert(error.message || 'Erreur lors de la suppression du cours');
        }
      });
    }
  }

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

  goBack(): void {
    if (this.isEnseignant) {
      this.router.navigate(['/enseignant/mes-cours']);
    } else {
      this.router.navigate(['/catalogue-cours']);
    }
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