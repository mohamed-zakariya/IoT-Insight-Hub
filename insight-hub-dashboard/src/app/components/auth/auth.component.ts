import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ForgotPasswordComponent } from '../forgot-password/forgot-password.component';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  ValidatorFn,  
} from '@angular/forms';
import { __values } from 'tslib';
import { AuthService } from '../../services/auth_service/auth.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { CustomValidators } from '../../shared/validators/custom-validators';
import { UserService } from '../../services/user_service/user.service';
import { User } from '../../models/user';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LoadingSpinnerComponent, ForgotPasswordComponent],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})

export class AuthComponent implements OnInit {
  mode: 'login' | 'signup' = 'login';
  isSignupMode: boolean = true;
  authFormLogin!: FormGroup;
  authFormSignup!: FormGroup;
  forgotPasswordForm!: FormGroup;
  otpForm!: FormGroup;
  loading = false;
  forgetPassword=false;
  showPassword: boolean = false;
  step = 1;
  emailNotFound = false;
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, CustomValidators.strongPassword]],
      dob: ['', [Validators.required, CustomValidators.ageRange(15, 120)]],
      gender: ['', Validators.required] // 👈 Add this line
    });
    
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



  get f() {
    return this.isSignupMode ? this.authFormSignup.controls : this.authFormLogin.controls;
  }
  
  submitted = false;

  onSubmit() {
    this.submitted = true;
    this.loading = true;
  
    const form = this.isSignupMode ? this.authFormSignup : this.authFormLogin;
  
    if (form.invalid) {
      console.log("invalid");
      console.log(form.value);
      this.authFormSignup.markAllAsTouched();
      this.loading = false;
      return;
    }
  
    console.log("submitted", form.value);
  
    // Delay before calling login or signup
    setTimeout(() => {
      if (this.isSignupMode) {
        console.log("entered111");
        // Create new user object from form data
        const newUser: User = {
          firstName: form.value.firstName,
          lastName: form.value.lastName,
          username: form.value.username,
          email: form.value.email,
          password: form.value.password,
          age: form.value.dob, // You can rename this if needed to match your backend model
          // gender: form.value.gender
        };
        
  
        // Call the createUser service method
        this.userService.createUser(newUser).subscribe({
          next: (response) => {
            this.loading = false;
            const user = response;  // Destructure and remove 'id'
            localStorage.setItem('user', JSON.stringify(user));
            this.router.navigate(['/home']);
            console.log('User created successfully:', response);
            // Handle successful user creation (e.g., navigate to login page or home)
          },
          error: (error) => {
            this.loading = false;
            console.error('Error creating user:', error);
          }
        });
      } else {
        // Login logic for existing users
        this.authService.login(form.value).subscribe({
          next: () => {
            this.loading = false;
        
            // Retrieve the user from local storage (set by setUser in AuthService)
            const username = localStorage.getItem('user');


            console.log("Logged in as:", username);
        
            this.router.navigate(['/home']);
          },
          error: (err) => {
            this.loading = false;
            console.error('Login failed', err);
          }
        });        
      }
    }, 1000); // 1 second delay
  }
  
  

  
  backToSignIn(){
    this.step = 1;
    this.forgetPassword = false;
    // this.verifiedUser = null;
  }


  retry() {
    this.forgotPasswordForm.reset();
    // If you want to focus the email input again, you could add additional logic here
  }

}
