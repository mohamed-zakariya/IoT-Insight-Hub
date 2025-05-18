import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:8080/api';
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    if (this.isBrowser) {
      this.loadUserFromToken();
    }
  }

  /** Load user from token if exists */
  private loadUserFromToken() {
    const token = this.getAuthToken();
    if (!token) {
      this.logoutAndRedirect();
      return;
    }
    const user = this.decodeToken(token);
    if (user) {
      this.setUser(user);
    } else {
      this.logoutAndRedirect();
    }
  }

  /** Save token only */
  public storeAuthToken(accessToken: string, refreshToken: string) {
    if (this.isBrowser) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);  // Save refresh token as well
    }
  }

  /** Retrieve access token */
  public getAuthToken(): string | null {
    return this.isBrowser ? localStorage.getItem('accessToken') : null;
  }

  /** Retrieve refresh token */
  public getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refreshToken') : null;

  }

  /** Decode token to extract user */
  public decodeToken(accessToken: string): User | null {
    try {
      const payload = atob(accessToken.split('.')[1]);
      return JSON.parse(payload);
    } catch (err) {
      console.error('Failed to decode token', err);
      return null;
    }
  }

  setUser(user: User) {
    this.currentUserSubject.next(user);
  }

  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.clear(); // ← clear all keys if your app stores user data
    }
    this.currentUserSubject.next(null);
  }

  public logoutAndRedirect(): Observable<void> {
    this.logout();
    this.router.navigate(['/auth']);
    return of(); // Return an observable that completes immediately
  }

  login(user: User): Observable<any> {
    console.log("post request", user);
  
    return this.http.post<{ accessToken: string; refreshToken: string; message: string }>(
      `${this.apiUrl}/users/signin/email`,
      user
    ).pipe(
      tap((response) => {
        // Store tokens
        this.storeAuthToken(response.accessToken, response.refreshToken);
  
        // Log response
        console.log('Access Token:', response.accessToken);
        console.log('Message:', response.message);
  
        // Decode token to get payload
        const payload: any = this.decodeToken(response.accessToken);
        const username = payload?.sub;
        console.log("Decoded username (sub):", username);
        localStorage.setItem('user', JSON.stringify({ username, email: user.email }));
  
        // Set user if valid
        if (username) {
          this.setUser(username);
        }
      }),
      catchError((error) => {
        console.log("ccccc", error);
        if (error.message === 401) {
          // Handle 401 Unauthorized error
          console.error("Invalid email or password");
          return throwError(() => new Error('Invalid email or password.'));
        } else {
          // Re-throw other errors
          return throwError(() => error);
        }
      })
    );
  }
  

  private addAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders().set('Content-Type', 'application/json');
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  // Request to refresh the access token
  public refreshAccessToken(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      return this.logoutAndRedirect();  // No refresh token, log out
    }
  
    // Construct the URL with the refreshToken as a query parameter
    const url = `http://localhost:8080/auth/refresh-token?refreshToken=${refreshToken}`;
  
    return this.http.post<{ accessToken: string }>(url, {}).pipe(
      tap((response) => {
        console.log(response);
        // Store new access token while reusing the existing refresh token
        this.storeAuthToken(response.accessToken, refreshToken);
      }),
      catchError((error) => {
        this.logoutAndRedirect();
        throw error;
      })
    );
  }
  
  

  // Intercept protected requests and ensure the token is valid
  someProtectedRequest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/protected-endpoint`, {
      headers: this.addAuthHeaders(),
    }).pipe(
      catchError((err) => {
        if (err.status === 401) {  // Unauthorized, token might have expired
          return this.refreshAccessToken().pipe(
            switchMap(() => {
              // Retry the original request with new token
              return this.http.get(`${this.apiUrl}/protected-endpoint`, {
                headers: this.addAuthHeaders(),
              });
            })
          );
        }
        throw err;
      })
    );
  }

  checkCurrentUser(): User | null {
    let user = this.currentUserSubject.getValue();
    if (!user) {
      this.loadUserFromToken();
      user = this.currentUserSubject.getValue();
    }
    return user;
  }
}
