import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { LoginService } from '../../services/login.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  role: string | null = null;
  private authSubscription!: Subscription;

  constructor(private loginService: LoginService, private router: Router) {}

  ngOnInit(): void {
    this.updateHeader();
    
    // S'abonner aux changements de route
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateHeader();
      });

    // S'abonner aux changements d'authentification
    this.authSubscription = this.loginService.getAuthStatus().subscribe(
      status => {
        this.isLoggedIn = status;
        this.role = this.loginService.getUserRole();
        console.log('Auth status changed - isLoggedIn:', this.isLoggedIn, 'role:', this.role);
      }
    );
  }

  updateHeader() {
    this.isLoggedIn = this.loginService.isLoggedIn();
    this.role = this.loginService.getUserRole();
    console.log('Header updated - isLoggedIn:', this.isLoggedIn, 'role:', this.role);
  }

  logout() {
    this.loginService.logout();
    this.router.navigate(['/connexion']).then(() => {
      // Forcer le rafraîchissement après déconnexion
      setTimeout(() => {
        this.updateHeader();
      }, 100);
    });
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }
}