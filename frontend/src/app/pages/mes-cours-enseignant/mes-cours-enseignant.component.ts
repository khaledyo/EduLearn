import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CoursService } from 'src/app/services/cours.service';

@Component({
  selector: 'app-mes-cours-enseignant',
  templateUrl: './mes-cours-enseignant.component.html',
  styleUrls: ['./mes-cours-enseignant.component.css']
})
export class MesCoursEnseignantComponent implements OnInit {
  user: any;
  stats: any = {};
  coursRecents: any[] = [];
  coursService: any;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadStats();
    this.loadCoursRecents();
  }

  loadStats() {
    // Données simulées - à remplacer par appel API
    this.stats = {
      coursCrees: this.coursService.getCoursByEnseignant(),
      etudiantsTotal: 45,
      messagesNonLus: 2
    };
  }


  // Modifiez également le chargement des cours récents
loadCoursRecents() {
  const enseignantId = parseInt(localStorage.getItem('id') || '0');
  this.coursService.getCoursRecents(enseignantId).subscribe({
    next: (cours: any[]) => {
      this.coursRecents = cours;
    },
    error: (error: any) => {
      console.error('Erreur chargement cours récents:', error);
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

  formatDate(date: Date): string {
    if (!date) return '';
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  naviguerVersDetailCours(coursId: number) {
  this.router.navigate(['/cours', coursId]);
}


}