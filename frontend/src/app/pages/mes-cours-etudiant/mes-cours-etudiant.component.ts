import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-mes-cours-etudiant',
  templateUrl: './mes-cours-etudiant.component.html',
  styleUrls: ['./mes-cours-etudiant.component.css']
})
export class MesCoursEtudiantComponent implements OnInit {
  user: any;
  mesCours: any[] = [];
  progressionPercentage: number = 0;

  constructor(
    private loginService: LoginService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadMesCours();
    this.calculateProgression();
  }

  loadMesCours(): void {
    // Simulation des cours de l'étudiant
    this.mesCours = [
      {
        id: 1,
        titre: 'Introduction à la programmation',
        description: 'Apprenez les bases de la programmation avec des exemples concrets et des exercices pratiques.'
      },
      {
        id: 2,
        titre: 'Mathématiques avancées',
        description: 'Cours approfondi sur les concepts mathématiques essentiels pour les études supérieures.'
      }
    ];
  }

  calculateProgression(): void {
    // Simulation du calcul de progression
    this.progressionPercentage = 35;
  }

  truncateDescription(description: string): string {
    const maxLength = 80;
    return description.length > maxLength 
      ? description.substring(0, maxLength) + '...' 
      : description;
  }

  navigateToCatalogue(): void {
    this.router.navigate(['/catalogue-cours']);
  }

  navigateToCoursDetail(coursId: number): void {
    this.router.navigate(['/cours-detail', coursId]);
  }
}