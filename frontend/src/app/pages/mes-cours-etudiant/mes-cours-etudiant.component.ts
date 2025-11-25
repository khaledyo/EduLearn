import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { CoursService, Cours } from '../../services/cours.service';
import { ClassService, Class } from '../../services/class.service';

@Component({
  selector: 'app-mes-cours-etudiant',
  templateUrl: './mes-cours-etudiant.component.html',
  styleUrls: ['./mes-cours-etudiant.component.css']
})
export class MesCoursEtudiantComponent implements OnInit {
  user: any;
  mesCours: Cours[] = [];
  mesClasses: Class[] = [];
  progressionPercentage: number = 0;

  constructor(
    private loginService: LoginService,
    private router: Router,
    private coursService: CoursService,
    private classService: ClassService
  ) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadMesCours();
    this.loadMesClasses();
    this.calculateProgression();
  }

  loadMesCours(): void {
    this.coursService.getTousLesCours().subscribe({
      next: (cours) => {
        this.mesCours = cours;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des cours étudiants:', error);
        this.mesCours = [];
      }
    });
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

  navigateToCoursDetail(coursId?: number): void {
    if (!coursId) {
      return;
    }
    this.router.navigate(['/cours-detail', coursId]);
  }

  loadMesClasses(): void {
    this.classService.getStudentClasses().subscribe({
      next: (classes) => {
        this.mesClasses = classes;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des classes:', error);
        this.mesClasses = [];
      }
    });
  }

  navigateToClassCourses(classId?: number): void {
    if (!classId) {
      return;
    }
    this.router.navigate(['/etudiant/classe', classId, 'cours']);
  }
}