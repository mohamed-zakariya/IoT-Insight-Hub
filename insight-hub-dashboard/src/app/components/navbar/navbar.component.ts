import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ProfileComponent } from '../profile/profile.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  logout() {
    // Your logout logic here
  }

  sidebarVisible = false;

  toggleSidebar() {
    this.sidebarVisible = !this.sidebarVisible;
  }

  constructor(private router: Router) {}

  signOut() {
    // Clear auth token or any necessary cleanup here
    // localStorage.removeItem('authToken'); // example
    this.router.navigate(['auth/login']);
  }
  
}
