import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { User } from '../../models/user';
import { AuthService } from '../auth_service/auth.service';
import { catchError, map, switchMap, tap } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getAuthToken();
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
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

  const userString = localStorage.getItem('user');
  if (!userString) {
    return throwError(() => new Error('User not found in localStorage'));
  }

  const { id: userId } = JSON.parse(userString);
  const url = `${this.apiUrl}/${userId}/password`;

  const makeRequest = () =>
    this.http.put(url, payload, {
      headers: this.getAuthHeaders(),
      responseType: 'text' as 'json'  // 👈 Tell Angular to treat text as JSON
    });

  return makeRequest().pipe(
    map(response => {
      // Handle plain text as message
      return { message: typeof response === 'string' ? response : (response as any).message };
    }),
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        return this.refreshAndRetryRequest(() =>
          this.http.put(`${this.apiUrl}/${userId}/password`, payload, {
            headers: this.getAuthHeaders(),
            responseType: 'text' as 'json'
          }).pipe(map(resp => ({ message: typeof resp === 'string' ? resp : (resp as any).message })))
        );
      }

      const errorText = err?.error?.text || err?.error || 'Unexpected error';
      console.error('Password update error:', errorText);
      return throwError(() => new Error(errorText));
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
    return this.http.post<{accessToken: string, refreshToken: string}>(`${this.apiUrl}/create`, user, {
      headers: this.getAuthHeaders()
    }).pipe(
      tap((response) => {
        if (response && response.accessToken && response.refreshToken) {
          this.authService.storeAuthToken(response.accessToken, response.refreshToken);
  
          const payload: any = this.authService.decodeToken(response.accessToken);
          const username = payload?.sub;
          console.log("Decoded username (sub):", username);
  
          localStorage.setItem('user', JSON.stringify({ username, email: user?.email }));
        }
      }),
      catchError((err) => {
        console.error('Error creating user 1:', err);
  
        // Check if the backend returned the email exists error
        if (err?.error === "A user with this email already exists.") {
          // Instead of throwing the full error, throw a custom object
          return throwError(() => ({ type: 'EMAIL_EXISTS' }));
        }
        else if(err?.error === "A user with this username already exists.") {
          return throwError(() => ({ type: 'USERNAME_EXISTS' }));
        }        

        // Otherwise, throw normal error
        return throwError(() => err);
      })
    );
  }
  
  
}
