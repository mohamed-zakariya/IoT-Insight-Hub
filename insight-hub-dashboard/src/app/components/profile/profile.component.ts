import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Adjust path as needed
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule]
})


export class ProfileComponent implements OnInit {
  user: User = {} as User;  // Initialize user as an empty object

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Fetch user data on component initialization
    const user = this.authService.checkCurrentUser();
    if (user) {
      this.user = user;
    }
  }
}
