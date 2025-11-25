import { Component } from '@angular/core';
import { LoginService } from './services/login.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'edulearn';
  constructor(private loginService: LoginService) {
    // ✅ Nettoyage des tokens expirés au chargement de l'application
    this.loginService.clearInvalidToken();
  }
}
