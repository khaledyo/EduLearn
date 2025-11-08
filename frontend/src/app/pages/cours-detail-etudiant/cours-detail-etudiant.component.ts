import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CoursService, Cours } from '../../services/cours.service';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-cours-detail-etudiant',
  templateUrl: './cours-detail-etudiant.component.html',
  styleUrls: ['./cours-detail-etudiant.component.css']
})
export class CoursDetailEtudiantComponent implements OnInit {
  cours: Cours | null = null;
  isLoading = true;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private coursService: CoursService,
    private loginService: LoginService
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadCoursDetail();
  }

  // loadCoursDetail(): void {
  //   const coursId = this.route.snapshot.paramMap.get('id');
  //   if (!coursId) {
  //     this.isLoading = false;
  //     console.error('ID du cours non trouvé dans l\'URL');
  //     return;
  //   }

  //   this.isLoading = true;
  //   this.coursService.getCoursById(+coursId).subscribe({
  //     next: (cours) => {
  //       this.cours = cours;
  //       this.isLoading = false;
  //     },
  //     error: (error) => {
  //       console.error('Erreur lors du chargement du cours:', error);
  //       this.isLoading = false;
  //       alert(error.message || 'Erreur lors du chargement du cours');
  //     }
  //   });
  // }
  

 loadCoursDetail(): void {
    // Simulation d'un cours pour test
    this.cours = {
      id: 4,
      titre: 'Bases de Données MySQL',
      description: 'Introduction à la modélisation, aux requêtes SQL et à l\'optimisation dans MySQL.',
      support: 'https://example.com/mysql-guide.pdf',
      dateCreation: new Date('2025-04-05'),
      enseignantId: 0,
      enseignantNom: "Nouicer",
      enseignantPrenom: "Abdelaziz",
      duree: 20,
      niveau: 'Débutant'
    };
    this.isLoading = false;
  }

  // Vérifie si l'utilisateur est inscrit au cours
  isEnrolled(): boolean {
    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    return enrollments.includes(this.cours?.id);
  }

  // S'inscrire au cours depuis la page détail
  enrollFromDetail(): void {
    if (!this.cours) return;

    const enrollments = JSON.parse(localStorage.getItem('coursEnrollments') || '[]');
    if (!enrollments.includes(this.cours.id)) {
      enrollments.push(this.cours.id);
      localStorage.setItem('coursEnrollments', JSON.stringify(enrollments));
      alert(`Félicitations ! Vous êtes maintenant inscrit au cours "${this.cours.titre}"`);
      
      // Recharger la page pour mettre à jour l'interface
      this.loadCoursDetail();
    } else {
      alert('Vous êtes déjà inscrit à ce cours');
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
    if (!this.isEnrolled()) {
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