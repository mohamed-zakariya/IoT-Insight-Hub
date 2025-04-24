import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  imports: [ReactiveFormsModule]

})
export class ForgotPasswordComponent {
  forgotForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.forgotForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      otp: ['', Validators.required]
    });
  }

  sendOtp() {
    // Simulate sending OTP
    alert('OTP sent to your email.');
  }

  onSubmit() {
    if (this.forgotForm.invalid) return;

    const { newPassword, confirmPassword } = this.forgotForm.value;

    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    // Submit logic
    console.log('Resetting password with data:', this.forgotForm.value);
  }
}
