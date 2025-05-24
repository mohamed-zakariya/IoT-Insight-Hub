import { Component, HostListener, OnInit } from '@angular/core';
import { Router, NavigationEnd, Event } from '@angular/router';
import { filter } from 'rxjs/operators';

import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { AuthService } from '../../services/auth_service/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,           
    LoadingSpinnerComponent 
  ],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  loading = false;
  sidebarVisible = false;
  isDesktop = true;

  /** only show on actual sensor routes */
  showSubMenu = false;

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // <-- no argument here
    this.onResize();

    this.router.events
      .pipe(
        filter((evt: Event): evt is NavigationEnd => evt instanceof NavigationEnd)
      )
      .subscribe(evt => {
        const url = evt.urlAfterRedirects;
        this.showSubMenu =
          url.startsWith('/traffic') ||
          url.startsWith('/environmental') ||
          url.startsWith('/street-light'); 
      });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.isDesktop = window.innerWidth >= 768;
    if (!this.isDesktop) {
      this.sidebarVisible = false;
    }
  }

  toggleSidebar(): void {
    this.sidebarVisible = !this.sidebarVisible;
    document.body.classList.toggle('sidebar-open', this.sidebarVisible);
  }

  signOut(): void {
    this.loading = true;
    setTimeout(() => {
      this.authService.logoutAndRedirect();
      this.loading = false;
    }, 1000);
  }
}
