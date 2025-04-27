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
  serverErrorMessage = '';

  passwordData = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  constructor(private authService: AuthService, private userService: UserService) {}

  ngOnInit(): void {
    const userData = localStorage.getItem('user');
    const email = userData ? JSON.parse(userData).email : null;

  
    if (email) {
      this.userService.getUserByEmail(email).subscribe({
        next: (userData) => {
          this.user = { ...userData };
          this.originalUser = { ...userData };
          console.log("Profile Data", this.originalUser);
    
          // Calculate age based on DOB
          if (this.originalUser?.dob) {
            const birthDate = new Date(this.originalUser.dob);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
    
            // Adjust age if the birthday hasn't occurred yet this year
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
              age--;
            }
    
            // Update dob field to the age
            this.user.age = age;
          }
    
          // Save the user data to localStorage
          localStorage.setItem('user', JSON.stringify({ 
            id: this.originalUser?.id, 
            email: this.originalUser?.email, 
            username: this.originalUser?.username,
            age: this.originalUser?.dob // Save the age instead of DOB
          }));
        },
        error: (err) => {
          if (err.message === 'UserNotFound') {
            console.error('User not found with email:', email);
          } else {
            console.error('Error fetching user data:', err);
          }
        }
      });
    } else {
      console.warn('No email found in auth service.');
    }      
  }
  

  changePassword(form: any) {
    this.passwordMismatch = false;
    this.oldPasswordError = false;
    this.passwordChangeSuccess = false;
    this.serverErrorMessage = '';
  
    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      this.passwordMismatch = true;
      return;
    }
  
    this.userService.updatePassword(
      form.value.oldPassword,
      form.value.newPassword
    ).subscribe({
      next: (res) => {
        console.log("in Component", res.message);
        this.passwordChangeSuccess = true;
        setTimeout(() => {
          this.passwordChangeSuccess = false;
        }, 4000);
        this.resetForm(form);
      },
      error: (err) => {
        // Check specific error message or fallback to general
        const errorMsg = err?.error?.message || err?.error || 'An unexpected error occurred.';
        
        if (errorMsg === 'Current password is incorrect.' || errorMsg === 'Old password is incorrect') {
          this.oldPasswordError = true;
        }
  
        this.serverErrorMessage = typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg);
        console.error('Password update error:', this.serverErrorMessage);
      }
    });
  }
  

  updateProfile(form: any) {
    const updatedData: Partial<User> = {
      firstName: this.user.firstName !== this.originalUser.firstName ? this.user.firstName : undefined,
      lastName: this.user.lastName !== this.originalUser.lastName ? this.user.lastName : undefined,
      current_postion: this.user.current_postion !== this.originalUser.current_postion ? this.user.current_postion : undefined,
      location: this.user.location !== this.originalUser.location ? this.user.location : undefined,
      description: this.user.description !== this.originalUser.description ? this.user.description : undefined,
      username: this.user.username !== this.originalUser.username ? this.user.username : undefined,
      // gender: this.user.gender !== this.originalUser.gender ? this.user.gender : undefined,
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
        console.log("enterend in udpate profile fn")
        this.updateMessage = 'Profile updated successfully!';
        this.updateSuccess = true;
        this.updateError = false;
        this.originalUser = { ...this.user };
      },
      error: (err) => {
        this.updateMessage = err.error?.message || 'An error occurred while updating profile.';
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
