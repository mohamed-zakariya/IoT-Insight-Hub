import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Inject, Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { OtpMessages } from '../../core/constants/otp-messages.constants';


@Injectable({
  providedIn: 'root'
})
export class OtpPasswordService {

  private apiUrl = `${environment.authUrl}`;
  http: HttpClient = inject(HttpClient);


  sendOtp(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
  
    return this.http.post(`${this.apiUrl}/forgot-password`, null, { params, responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('Raw response:', response);
  
        // Since responseType is 'text', response will be a string
        if (typeof response === 'string') {
          if (response.includes(OtpMessages.OTP_SENT)) {
            localStorage.setItem('email', email);
            return { message: 'OTP has been sent to your email.' };
          } else {
            // If unexpected text
            throw new Error(OtpMessages.UNEXPECTED_RESPONSE);
          }
        }
  
        return response;
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred.';
        console.log("Caught error:", error);
  
        if (typeof error.error === 'string') {
          if (error.error.includes(OtpMessages.USER_NOT_FOUND )) {
            errorMessage = 'Email does not exist.';
          } else {
            errorMessage = error.error;
          }
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = OtpMessages. INVALID_EMAIL;
        } else if (error.status >= 500) {
          errorMessage = OtpMessages.SERVER_ERROR;
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
          if (response.includes( OtpMessages.VALID_OTP)) {
            localStorage.setItem('otp', otp);
            return  OtpMessages.VALID_OTP;
          } else if (response.includes(OtpMessages.INVALID_OTP )) {
            return OtpMessages.INVALID_OTP ;
          } else if (response.includes('Expired OTP')) {
            return 'Expired OTP';
          } else {
            throw new Error(OtpMessages.UNEXPECTED_OTP_RESPONSE);
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
          errorMessage = OtpMessages.INVALID_OTP_REQUEST;
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
      return throwError(() => new Error(OtpMessages.MISSING_LOCAL_DATA));
    }
  
    const params = new HttpParams()
      .set('email', email)
      .set('otp', otp)
      .set('newPassword', newPassword);
  
    return this.http.post(`${this.apiUrl}/verify-otp`, null, { params, responseType: 'text' as 'json' }).pipe(
      map(response => {
        console.log('Password reset response:', response);
        if (typeof response === 'string') {
          if (response.includes( OtpMessages.PASSWORD_RESET_SUCCESS)) {
            return 'Password reset successful';
          } else {
            throw new Error(OtpMessages.UNEXPECTED_RESET_RESPONSE);
          }
        }
        return response;
      }),
      catchError(error => {
        let errorMessage = OtpMessages.PASSWORD_RESET_ERROR;
        console.log('Caught error:', error);
  
        if (typeof error.error === 'string') {
          errorMessage = error.error;
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = OtpMessages.INVALID_PASSWORD_RESET;
        } else if (error.status >= 500) {
          errorMessage =  OtpMessages.SERVER_ERROR_RESET;
        }
  
        return throwError(() => new Error(errorMessage));
      })
    );
  }
  
  
}
