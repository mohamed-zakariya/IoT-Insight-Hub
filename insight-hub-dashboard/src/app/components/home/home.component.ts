import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth_service/auth.service'; // adjust path if needed
import { User } from '../../models/user';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'] // note the correct property name is **styleUrls**, not styleUrl
})
export class HomeComponent implements OnInit {
  date: Date = new Date();
  currentUser: User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser = user;
      console.log('Current user:', this.currentUser);
    });
  }
}
