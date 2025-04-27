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
  otpForm!: FormGroup;
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
        console.log("ssss",response);
      },
      error: (err: Error) => {
        console.error(err.message);
        if (err.message === 'Email does not exist.') {
          this.emailNotFound = true;
        } else {
          this.emailNotFound = true;
          // alert(err.message); // Optional: show other errors nicely (network/server errors)
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
    // Call your real OTP API here
    // this.authService.verifyOtp(this.verifiedUser.email, code).subscribe(...)

    // Simulated success
    this.loading = false;
    this.step = 3;
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
    if (input.value && index < this.otpControls.length - 1) {
      const next = document.querySelectorAll<HTMLInputElement>('.otp-box')[index + 1];
      next?.focus();
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
}
