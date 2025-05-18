import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OtpPasswordService {

  private apiUrl = 'http://localhost:8080/api/auth';
  http: HttpClient = inject(HttpClient);


  sendOtp(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
  
    return this.http.post(`${this.apiUrl}/forgot-password`, null, { params, responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('Raw response:', response);
  
        // Since responseType is 'text', response will be a string
        if (typeof response === 'string') {
          if (response.includes('OTP has been sent')) {
            localStorage.setItem('email', email);
            return { message: 'OTP has been sent to your email.' };
          } else {
            // If unexpected text
            throw new Error('Unexpected server response.');
          }
        }
  
        return response;
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred.';
        console.log("Caught error:", error);
  
        if (typeof error.error === 'string') {
          if (error.error.includes('User not found')) {
            errorMessage = 'Email does not exist.';
          } else {
            errorMessage = error.error;
          }
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = 'Invalid email address.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error, try again later.';
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }  
  
  checkOtp(otp: string): Observable<any> {
    const params = new HttpParams().set('otp', otp);
  
    return this.http.post(`${this.apiUrl}/check-otp`, null, { params, responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('OTP check response:', response);
        if (typeof response === 'string') {
          if (response.includes('Valid OTP')) {
            localStorage.setItem('otp', otp);
            return 'Valid OTP';
          } else if (response.includes('Invalid OTP')) {
            return 'Invalid OTP';
          } else if (response.includes('Expired OTP')) {
            return 'Expired OTP';
          } else {
            throw new Error('Unexpected OTP verification response.');
          }
        }
        return response;
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred during OTP verification.';
        console.log("Caught error:", error);
  
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = 'Invalid OTP verification request.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error while verifying OTP.';
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  
  verifyOtpAndResetPassword(newPassword: string): Observable<any> {
    const email = localStorage.getItem('email');
    const otp = localStorage.getItem('otp');
  
    if (!email || !otp) {
      return throwError(() => new Error('Missing email or OTP from local storage.'));
    }
  
    const params = new HttpParams()
      .set('email', email)
      .set('otp', otp)
      .set('newPassword', newPassword);
  
    return this.http.post(`${this.apiUrl}/verify-otp`, null, { params, responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('Password reset response:', response);
        if (typeof response === 'string') {
          if (response.includes('Password has been reset successfully.')) {
            return 'Password reset successful';
          } else {
            throw new Error('Unexpected password reset response.');
          }
        }
        return response;
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred during password reset.';
        console.log('Caught error:', error);
  
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = 'Invalid password reset request.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error while resetting password.';
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  
}
