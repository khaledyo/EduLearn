import { Component, OnInit } from '@angular/core';
import { LoginService } from '../../services/login.service';

@Component({
  selector: 'app-mes-cours-etudiant',
  templateUrl: './mes-cours-etudiant.component.html',
  styleUrls: ['./mes-cours-etudiant.component.css']
})
export class MesCoursEtudiantComponent implements OnInit {
  user: any;

  constructor(private loginService: LoginService) {}

  ngOnInit(): void {
    this.user = this.loginService.getUserData();
  }
}