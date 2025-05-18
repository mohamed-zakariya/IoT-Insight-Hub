import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthService } from '../../services/auth_service/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

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

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.checkScreenSize();
  }

  checkScreenSize(): void {
    this.isDesktop = window.innerWidth > 768;
    if (this.isDesktop) {
      this.sidebarVisible = true;
    } else {
      this.sidebarVisible = false;
    }
  }

  toggleSidebar(): void {
    if (!this.isDesktop) {
      this.sidebarVisible = !this.sidebarVisible;
    }
  }

  closeSidebar(): void {
    if (!this.isDesktop) {
      this.sidebarVisible = false;
    }
  }

  signOut(): void {
    this.loading = true;

    setTimeout(() => {
      this.authService.logoutAndRedirect();
      this.loading = false;
    }, 1000);
  }
}
