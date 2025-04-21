import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
} from '@angular/forms';
import { __values } from 'tslib';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})

export class AuthComponent implements OnInit {
  mode: 'login' | 'signup' = 'login';
  isSignupMode: boolean = false;
  authFormLogin!: FormGroup;
  authFormSignup!: FormGroup;
  

  constructor(private fb: FormBuilder, private route: ActivatedRoute, private router:Router, private authService: AuthService ) {}


  toggleMode() {
    this.isSignupMode = !this.isSignupMode;
  
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
      password: ['', [Validators.required, Validators.minLength(6), this.noWhitespaceValidator]],
    });

    this.authFormSignup = this.fb.group({
      firstName: ['', Validators.required, Validators.minLength(3)],
      lastName: ['', Validators.required, Validators.minLength(3)],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6), this.noWhitespaceValidator]],
      dob: ['', [Validators.required, this.ageRangeValidator(1, 120)]]
    });
    

    this.route.params.subscribe((params) => {
      this.mode = params['mode'] === 'signup' ? 'signup' : 'login';
      this.isSignupMode = this.mode === 'signup';
      this.toggleMode(); // Apply the correct validation on first load
    });
  }

  noWhitespaceValidator(control: AbstractControl): ValidationErrors | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  }


  get f() {
    return this.isSignupMode ? this.authFormSignup.controls : this.authFormLogin.controls;
  }
  
  submitted = false;

  onSubmit() {
    this.submitted = true;
    const form = this.isSignupMode ? this.authFormSignup : this.authFormLogin;
    if (form.invalid ) {
      form.markAllAsTouched();
      return;
    }
  
    const dob = form.value.dob;
    const age = this.calculateAge(dob); // you can log or use this


     // Replace this with actual logic (e.g., checking with a backend API)
  const allowedUser = {
    email: 'mohamedzakariaali@gmail.com',
    password: '123456'
  };
  

    // if (form.value.email === allowedUser.email && form.value.password === allowedUser.password) {
    //   console.log('Login matched. Redirecting to Home...');
    //   this.router.navigate(['/home']);
    // } else {
    //   console.log('Invalid credentials');
    //   // You can also show a message on the UI
    // }

    console.log("submitted", form.value)

    // In your component or service after successful login
    this.authService.login(form.value).subscribe({
      next: (response) => {
        localStorage.setItem('auth_token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Login failed', err);
      }
    });
    
    
  }

  // onSubmit() {
  //   console.log("entered");
  //   this.submitted = true;
  //   const form = this.isSignupMode ? this.authFormSignup : this.authFormLogin;
  //   if (form.invalid) {
  //     form.markAllAsTouched();
  //     return;
  //   }

  //   console.log('Submitted:', form.value);
  // }

  ageRangeValidator(minAge: number, maxAge: number): ValidationErrors {
    return (control: AbstractControl): ValidationErrors | null => {
      const dob = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
  
      if (isNaN(age) || age < minAge || age > maxAge) {
        return { invalidAge: true };
      }
  
      return null;
    };
  }

 
  
  calculateAge(dob: string): number {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }
  



  
  
}
