// src/app/app.component.ts
import { Component }            from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule }         from '@angular/common';
import { filter }               from 'rxjs/operators';

import { NavbarComponent }      from './components/navbar/navbar.component';
import { AlertButtonComponent } from './components/alert-button/alert-button.component';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterModule,
    NavbarComponent,
    AlertButtonComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showNavbar = true;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => {
        this.showNavbar = !e.urlAfterRedirects.startsWith('/auth');
      });
  }
}
