import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../../models/user';
import { AuthService } from '../auth_service/auth.service';
import { catchError, switchMap, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('accessToken', token);
    }
    return headers;
  }
  

  // Helper method to handle token refresh and retry
  private refreshAndRetryRequest(requestFn: () => Observable<any>): Observable<any> {
    return this.authService.refreshAccessToken().pipe(
      switchMap(() => {
        return requestFn(); // Retry the original request after refreshing the token
      }),
      catchError((error) => {
        // If refreshing the token fails, log out the user
        this.authService.logoutAndRedirect();
        throw error; // Rethrow the error after logging out
      })
    );
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/profile`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError((err) => {
        if (err.status === 401) {  // Unauthorized, token might have expired
          return this.refreshAndRetryRequest(() => this.http.get<User>(`${this.apiUrl}/profile`, {
            headers: this.getAuthHeaders()
          }));
        }
        throw err;
      })
    );
  }

  updateProfile(data: Partial<User>): Observable<User> {
    const userString = localStorage.getItem('user');
    if (!userString) {
      return throwError(() => new Error('User not found in local storage'));
    }
  
    const user = JSON.parse(userString);
    const userId = user.id;
  
    // Get headers using the existing method
    const headers = this.getAuthHeaders();
  
    // Log the request information (for debugging)
    console.log('Sending request to update profile with data:', data);
    console.log('Request URL:', `${this.apiUrl}/${userId}`);
    console.log('Headers:', headers);
  
    return this.http.put<User>(`${this.apiUrl}/${userId}`, data, { headers })
      .pipe(
        catchError((err) => {
          if (err.status === 401) {
            return this.refreshAndRetryRequest(() =>
              this.http.put<User>(`${this.apiUrl}/${userId}`, data, { headers: this.getAuthHeaders() })
            );
          }
          throw err;
        })
      );
  }
  
  
  
  

  updatePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    const payload = { oldPassword: currentPassword, newPassword };
  
    // Get user info from localStorage
    const userString = localStorage.getItem('user');
    if (!userString) {
      return throwError(() => new Error('User not found in localStorage'));
    }
  
    const { id: userId } = JSON.parse(userString);
    const url = `${this.apiUrl}/${userId}/password`;
  
    const makeRequest = () => this.http.put<{ message: string }>(url, payload, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'  // 👈 tell Angular to expect plain text
    });
  
    return makeRequest().pipe(
      catchError(err => {
        if (err.status === 401 || err.status === 403) {
          return this.refreshAndRetryRequest(makeRequest);
        }
        console.error('Password update error:', err);
        throw err;
      })
    );
  }
  
  

  // Get public user info by email (no auth required)
  getUserByEmail(email: string): Observable<User> {
    return this.http
      .get<User>(`${this.apiUrl}/${encodeURIComponent(email)}`)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          console.error(`Error fetching user with email ${email}:`, err);
  
          if (err.status === 404) {
            // user not found → propagate as an error
            return throwError(() => new Error('UserNotFound'));
          }
  
          // other errors → you could return a default, or propagate too
          return throwError(() => err);
        })
      );
  }


  createUser(user: User): Observable<any> {
    console.log(user);
    return this.http.post<{accessToken: string, refreshToken:string}>(`${this.apiUrl}/create`, user, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => {
        // Assuming response contains accessToken and refreshToken
        if (response && response.accessToken && response.refreshToken) {
          // Store the tokens in the local storage or wherever needed
          this.authService.storeAuthToken(response.accessToken, response.refreshToken);
  
          // Decode the user from the access token
          const user = this.authService.decodeToken(response.accessToken);
  
          // If decoding is successful, set the user
          if (user) {
            this.authService.setUser(user);
          }
        }
      }),
      catchError((err) => {
        console.error('Error creating user:', err);
        throw err; // Rethrow error after logging
      })
    );
  }
  
}
