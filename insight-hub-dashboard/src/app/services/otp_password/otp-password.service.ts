import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class OtpPasswordService {

  private apiUrl = 'http://localhost:8080/api/auth';


  constructor(private http: HttpClient) {}

  sendOtp(email: string): Observable<any> {
    const params = new HttpParams().set('email', email); // Create query params
    
    return this.http.post<any>(`${this.apiUrl}/forgot-password`, null, { params }).pipe( // Send email as query param
      map(response => {
        if (response.message !== 'OTP has been sent to your email.') {
          throw new Error('Unexpected server response.');
        }
        return response;
      }),
      catchError(error => {
        let errorMessage = 'An unknown error occurred.';
        
        // Handle specific server response messages
        if (error.error && error.error.message) {
          if (error.error.message.toLowerCase().includes('User not found')) { // Adjust to match "User not found"
            errorMessage = 'Email does not exist.';
          } else {
            errorMessage = error.error.message;
          }
        } else if (error.status === 0) {
          errorMessage = 'Cannot connect to server.';
        } else if (error.status >= 400 && error.status < 500) {
          errorMessage = 'Invalid email address.';
        } else if (error.status >= 500) {
          errorMessage = 'Server error, try again later.';
        }
  
        return throwError(() => new Error(errorMessage)); // Return the error message
      })
    );
  }
  
  
  
}
