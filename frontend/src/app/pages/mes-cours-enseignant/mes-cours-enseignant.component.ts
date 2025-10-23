import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-mes-cours-enseignant',
  templateUrl: './mes-cours-enseignant.component.html',
  styleUrls: ['./mes-cours-enseignant.component.css']
})
export class MesCoursEnseignantComponent implements OnInit {
  user: any;
  stats: any = {};

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
    this.loadStats();
  }

  loadStats() {
    // Pour l'instant, on initialise à 0
    // Plus tard, on fera des appels API pour récupérer les vraies données
    this.stats = {
      coursCrees: 0,
      etudiantsTotal: 0,
      messagesNonLus: 0
    };
    
    // Exemple de comment ça pourrait être plus tard :
    // this.coursService.getTeacherStats(this.user.id).subscribe(stats => {
    //   this.stats = stats;
    // });
  }
}