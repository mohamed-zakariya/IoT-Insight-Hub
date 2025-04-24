import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth_service/auth.service';
import { User } from '../../models/user';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user_service/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  imports: [CommonModule, FormsModule]
})
export class ProfileComponent implements OnInit {
  user: User = {} as User;
  originalUser: User = {} as User;
  passwordMismatch = false;
  oldPasswordError = false;
  passwordChangeSuccess = false;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  updateMessage = '';
  updateSuccess = false;
  updateError = false;

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    const user = this.authService.checkCurrentUser();
    if (user) {
      this.user = { ...user };
      this.originalUser = { ...user };
    }
  }

  changePassword(form: any) {
    this.passwordMismatch = false;
    this.oldPasswordError = false;
    this.passwordChangeSuccess = false;

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }

    this.userService.updatePassword(
      form.value.oldPassword,
      form.value.newPassword
    ).subscribe({
      next: (res) => {
        console.log(res.message);
        this.passwordChangeSuccess = true;
        setTimeout(() => {
          this.passwordChangeSuccess = false;
        }, 4000);
        this.resetForm(form);
      },
      error: (err) => {
        if (err.error.message === 'Current password is incorrect.') {
          this.oldPasswordError = true;
        }
        console.error(err.error.message);
      }
    });
  }

  updateProfile(form: any) {
    const updatedData: Partial<User> = {
      firstName: this.user.firstName !== this.originalUser.firstName ? this.user.firstName : undefined,
      lastName: this.user.lastName !== this.originalUser.lastName ? this.user.lastName : undefined,
      position: this.user.position !== this.originalUser.position ? this.user.position : undefined,
      location: this.user.location !== this.originalUser.location ? this.user.location : undefined,
      description: this.user.description !== this.originalUser.description ? this.user.description : undefined
    };

    const payload = Object.fromEntries(
      Object.entries(updatedData).filter(([_, v]) => v !== undefined)
    );

    this.updateMessage = '';
    this.updateSuccess = false;
    this.updateError = false;

    if (Object.keys(payload).length === 0) {
      this.updateMessage = 'Please update at least one field before submitting.';
      this.updateError = true;
      return;
    }

    this.userService.updateProfile(payload).subscribe({
      next: (res) => {
        this.updateMessage = 'Profile updated successfully!';
        this.updateSuccess = true;
        this.updateError = false;
        this.originalUser = { ...this.user };
      },
      error: (err) => {
        this.updateMessage = err.error.message || 'An error occurred while updating profile.';
        this.updateError = true;
        this.updateSuccess = false;
      }
    });
  }

  cancelEdit() {
    this.user = { ...this.originalUser };
  }

  resetForm(form: any) {
    form.resetForm();
    this.passwordMismatch = false;
  }
}
