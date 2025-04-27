import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
  AbstractControl,
} from '@angular/forms';
import { __values } from 'tslib';
import { AuthService } from '../../services/auth_service/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CustomValidators } from '../../shared/validators/custom-validators';
import { UserService } from '../../services/user_service/user.service';
import { User } from '../../models/user';
import { from } from 'rxjs';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, ForgotPasswordComponent, FormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})

export class AuthComponent implements OnInit {
  mode: 'login' | 'signup' = 'login';
  isSignupMode: boolean = false;
  authFormLogin!: FormGroup;
  authFormSignup!: FormGroup;
  forgotPasswordForm!: FormGroup;
  otpForm!: FormGroup;
  loading = false;
  forgetPassword=false;
  showPassword: boolean = false;
  step = 1;
  emailNotFound = false;
  confirmPassword: string = '';
  showConfirmPassword: boolean = false;
  passwordsDoNotMatch: boolean = false;
  confirmPasswordTouched: boolean = false;
  authError: string = "";

  // verifiedUser: any = null;




  constructor(private fb: FormBuilder, private route: ActivatedRoute,
     private router:Router, private authService: AuthService,
    private userService: UserService
  ) {}

  forgetPasswordClick() {
    this.forgetPassword = true;
    this.isSignupMode = false; // Switch to login mode if needed
  }

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  toggleMode() {
    this.isSignupMode = !this.isSignupMode;
    if (this.isSignupMode) {
      this.forgetPassword = false; // Reset the forget password when switching to signup
    }
  
    // Reset validators conditionally (if using 'age' in the future)
    const ageControl = this.authFormLogin.get('age');
    if (this.isSignupMode) {
      ageControl?.setValidators([Validators.required, Validators.min(1), Validators.max(120)]);
    } else {
      ageControl?.clearValidators();
    }
    ageControl?.updateValueAndValidity();
  
    // Reset both forms and clear validation states
    this.authFormLogin.reset();
    this.authFormSignup.reset();
  
    // Optional: mark all controls as untouched and pristine (in case you need more control)
    Object.values(this.authFormLogin.controls).forEach(control => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });
  
    Object.values(this.authFormSignup.controls).forEach(control => {
      control.setErrors(null);
      control.markAsPristine();
      control.markAsUntouched();
    });
  
    // Reset submission flag if used in template
    this.submitted = false;
  }
  

  ngOnInit(): void {
    

  
    this.authFormLogin = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, CustomValidators.strongPassword]],
    });


    this.authFormSignup = this.fb.group({
      firstName: ['', [CustomValidators.name]],
      lastName: ['', [CustomValidators.name]],      
      username: ['', [Validators.required, CustomValidators.username]],
      email: ['', [Validators.required, CustomValidators.customEmailValidator]],
      password: ['', [Validators.required, CustomValidators.strongPassword]],
      confirmPassword: ['', Validators.required], // Add validation if necessary
      dob: ['', [Validators.required, CustomValidators.ageRange(15, 120)]],
      gender: ['', Validators.required] // 👈 Add this line
    });

     // Apply the custom validator to confirmPassword
      this.authFormSignup.get('confirmPassword')?.setValidators([
        Validators.required,
        this.matchPasswordValidator.bind(this)  // Ensure the context of "this" is correct
      ]);

      this.authFormSignup.get('confirmPassword')?.updateValueAndValidity();  // Trigger validation check
      // Apply the group-level validator after the form is created    
    
    // this.otpForm = this.fb.group({
    //   otp: ['', [Validators.required, Validators.minLength(6)]],
    // });
      
    
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.route.params.subscribe((params) => {
      this.mode = params['mode'] === 'signup' ? 'signup' : 'login';
      this.isSignupMode = this.mode === 'signup';
      this.toggleMode(); // Apply the correct validation on first load
    });


  }

  matchPasswordValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = this.authFormSignup.get('password')?.value;
    if (password && control.value !== password) {
      return { passwordsDoNotMatch: true };
    }
    return null;
  }
  
  
  onConfirmPasswordTouched() {
    this.authFormSignup.get('confirmPassword')?.markAsTouched();
  
    const password = this.authFormSignup.get('password')?.value;
    const confirmPassword = this.authFormSignup.get('confirmPassword')?.value;
    this.passwordsDoNotMatch = password && confirmPassword && password !== confirmPassword;
  }
  
  



  get f() {
    return this.isSignupMode ? this.authFormSignup.controls : this.authFormLogin.controls;
  }
  
  submitted = false;

  onSubmit() {
    this.submitted = true;
    this.authError = ''; // Reset error message before submitting

    
    const form = this.isSignupMode ? this.authFormSignup : this.authFormLogin;
  
    if (form.invalid) {
      console.log("invalid form");
      form.markAllAsTouched();
      return;
    }
  
    console.log("submitted", form.value);
  
    if (this.isSignupMode) {
      this.loading = true; // ✅ Start spinner immediately
  
      const newUser: User = {
        firstName: form.value.firstName,
        lastName: form.value.lastName,
        username: form.value.username,
        email: form.value.email,
        password: form.value.password,
        dob: form.value.dob,
        gender: form.value.gender
      };
  
      this.userService.createUser(newUser).subscribe({
        next: (response) => {
          console.log('User created successfully:', response);
          this.router.navigate(['/home']);
          this.loading = false; // ✅ Stop spinner after success
        },
        error: (error) => {
          console.error('Error creating user:', error);
  
          if (error?.type === 'EMAIL_EXISTS') {
            console.log("A user with this email already exists.");
            this.authFormSignup.get('email')?.setErrors({ emailExists: true });
          } else if (error?.type === 'USERNAME_EXISTS') {
            console.log("A user with this username already exists.");
            this.authFormSignup.get('username')?.setErrors({ usernameExists: true });
          } else {
            console.error('Other error creating user:', error);
          }
  
          this.loading = false; // ✅ Always stop spinner after error
        }
      });
  
    } else {
      this.loading = true; // ✅ Start spinner immediately
  
      this.authService.login(form.value).subscribe({
        next: () => {
          console.log("Logged in successfully");
          const username = localStorage.getItem('user');
          console.log("Logged in as:", username);
          this.router.navigate(['/home']);
          this.loading = false; // ✅ Stop spinner after success
        },
        error: (error) => {
          console.error('Error logging in:', error);
          this.loading = false;
  
          if (error.status === 401 && error.error?.message === 'Invalid email or password') {
            this.authError = "Invalid email or password.";
            console.log("auth error", this.authError);
          } else {
            this.authError = "An unexpected error occurred. Please try again.";
          }
        }
      });
    }
  }
  
  
  

  
  backToSignIn(){
    this.step = 1;
    this.forgetPassword = false;
    // this.verifiedUser = null;
  }

  
  // Toggle password visibility
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


  retry() {
    this.forgotPasswordForm.reset();
    // If you want to focus the email input again, you could add additional logic here
  }


  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
  
}
