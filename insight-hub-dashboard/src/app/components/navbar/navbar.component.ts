import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth_service/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule, LoadingSpinnerComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  loading = false;

  logout() {
    // Your logout logic here
  }

  sidebarVisible = false;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  constructor(private router: Router, private authService: AuthService) {}

  signOut() {
    this.loading = true; // Show spinner

  // Optional: Add a delay for smoother UX (1s here)
  setTimeout(() => {
    this.authService.logoutAndRedirect();
    // this.router.navigate(['auth/login']); // Or your login route

    this.loading = false; // Hide spinner after navigation
  }, 1000);
  }
  
}
