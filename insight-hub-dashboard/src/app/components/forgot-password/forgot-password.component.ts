import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { UserService } from '../../services/user_service/user.service';
import { OtpPasswordService } from '../../services/otp_password/otp-password.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule]
})
export class ForgotPasswordComponent implements OnInit {

  @Output() backToSignIn = new EventEmitter<void>();

  forgotPasswordForm!: FormGroup;
  resetPasswordForm!: FormGroup; // <-- instead of passwordResetForm
  otpForm!: FormGroup;
  passwordVisible = false;
  confirmPasswordVisible = false; 
  loading = false;
  emailNotFound = false;
  step = 1;
  verifiedUser: any = null;
  otpControls = ['c0', 'c1', 'c2', 'c3', 'c4', 'c5'];

  constructor(private fb: FormBuilder, private userService: UserService, private otpPasswordService: OtpPasswordService) {}

  ngOnInit(): void {
    this.forgotPasswordForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  
    const group: { [key: string]: any } = {};
    this.otpControls.forEach(c => {
      group[c] = ['', [Validators.required, Validators.pattern(/^\d$/)]];
    });
  
    this.otpForm = this.fb.group(group, {
      validators: [this.minLengthValidator(6)]
    });
  
    this.initPasswordForm(); // ✅ Call this to initialize resetPasswordForm properly
  }
  

  
  minLengthValidator(len: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const fg = control as FormGroup;
      const code = this.otpControls
        .map((c) => fg.get(c)?.value || '')
        .join('');
      return code.length === len ? null : { minlength: true };
    };
  }

  onEmailSubmit() {
    if (this.forgotPasswordForm.invalid) return;
  
    this.emailNotFound = false;
    const email = this.forgotPasswordForm.value.email;
    this.loading = true;
  
    this.otpPasswordService.sendOtp(email).subscribe({
      next: (response) => {
        console.log("Success response:", response);
        if (response?.message === 'OTP has been sent to your email.') {
          this.emailNotFound = false;
          
          // ✅ Move to Step 2
          this.step = 2;
  
          // Optionally reset OTP form here if needed
          this.otpForm.reset();
        }
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error:', err.message);
  
        if (err.message === 'Email does not exist.') {
          this.emailNotFound = true;
        } else {
          this.emailNotFound = true;
        }
        this.loading = false;
      }
    });
  }
  
  
  

  onOtpSubmit() {
    if (this.otpForm.valid) {
      this.loading = true;
      const code = this.otpControls.map(c => this.otpForm.get(c)?.value).join('');
      this.verifyOtp(code);
    }
  }

  private verifyOtp(code: string) {
    this.otpPasswordService.checkOtp(code).subscribe({
      next: (result: any) => {
        console.log('OTP verification result:', result);
        if (result === 'Valid OTP') {
          this.step = 3; // move to password reset step
        } else if (result === 'Invalid OTP') {
          // Show error to user
          alert('Invalid OTP. Please try again.');
        } else if (result === 'Expired OTP') {
          alert('OTP has expired. Please request a new one.');
          this.step = 1; // go back to Step 1
        }
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Error verifying OTP:', err.message);
        alert(err.message);
        this.loading = false;
      }
    });
  }
  

  

  private initPasswordForm(): void {
    this.resetPasswordForm = this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.pattern('^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d@$!%*#?&]{8,}$') // 1 letter, 1 number minimum
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: [this.passwordMatchValidator] });
  }
  

  private passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  onResetPasswordSubmit() {
    if (this.resetPasswordForm.invalid) return;
  
    const newPassword = this.resetPasswordForm.value.password;
  
    this.loading = true;
  
    this.otpPasswordService.verifyOtpAndResetPassword(newPassword).subscribe({
      next: (message: any) => {
        console.log('Password reset success:', message);
        alert('Your password has been reset successfully! Please sign in.');
  
        // Optionally clear the localStorage
        localStorage.removeItem('email');
        localStorage.removeItem('otp');
  
        // Optionally go back to sign in
        this.backToSignInClick();
        this.loading = false;
      },
      error: (err: Error) => {
        console.error('Password reset error:', err.message);
        alert(err.message);
        this.loading = false;
      }
    });
  }
  


  resendOtp() {
    const email = this.verifiedUser?.email;
    if (email) {
      // Call resend OTP API
      // this.authService.resendOtp(email).subscribe(...)
      console.log('OTP resent to', email);
    }
  }

  retry() {
    this.emailNotFound = false;
    this.forgotPasswordForm.reset();
  }

  backToSignInClick() {
    this.backToSignIn.emit();
  }

  onOtpKeyUp(event: KeyboardEvent, index: number): void {
    const input = event.target as HTMLInputElement;
    const key = event.key;
  
    if (key === 'Backspace') {
      if (!input.value && index > 0) {
        // Move focus to previous input
        const prevInput = document.querySelectorAll<HTMLInputElement>('.otp-box')[index - 1];
        prevInput?.focus();
        // Clear previous input value too
        this.otpForm.get(this.otpControls[index - 1])?.setValue('');
      } else {
        // Just clear the current box if it's not empty
        this.otpForm.get(this.otpControls[index])?.setValue('');
      }
    } else if (input.value && index < this.otpControls.length - 1) {
      // Move to next input if filled
      const nextInput = document.querySelectorAll<HTMLInputElement>('.otp-box')[index + 1];
      nextInput?.focus();
    }
  }
  

  onOtpPaste(event: ClipboardEvent): void {
    const pastedText = event.clipboardData?.getData('text') || '';
    if (pastedText.length === this.otpControls.length) {
      this.otpControls.forEach((ctrlName, index) => {
        this.otpForm.get(ctrlName)?.setValue(pastedText[index]);
      });
    }
    event.preventDefault();
  }


  // Method to toggle visibility of New Password
  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  // Method to toggle visibility of Confirm Password
  toggleConfirmPasswordVisibility() {
    this.confirmPasswordVisible = !this.confirmPasswordVisible;
  }
}
