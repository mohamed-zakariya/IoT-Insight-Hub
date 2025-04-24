import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api';
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
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);  // Save refresh token as well
    }
  }

  /** Retrieve access token */
  public getAuthToken(): string | null {
    return this.isBrowser ? localStorage.getItem('access_token') : null;
  }

  /** Retrieve refresh token */
  public getRefreshToken(): string | null {
    return this.isBrowser ? localStorage.getItem('refresh_token') : null;
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
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.clear(); // ← clear all keys if your app stores user data
    }
    this.currentUserSubject.next(null);
  }

  public logoutAndRedirect(): Observable<void> {
    this.logout();
    this.router.navigate(['/auth/login']);
    return of(); // Return an observable that completes immediately
  }

  login(user: User): Observable<any> {
    console.log(user);
    return this.http.post<{ accessToken: string, refreshToken: string }>(`${this.apiUrl}/login`, user).pipe(
      tap((response) => {
        this.storeAuthToken(response.accessToken, response.refreshToken);
        const user = this.decodeToken(response.accessToken);
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  private addAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders();
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

    return this.http.post<{ accessToken: string }>(`${this.apiUrl}/token/refresh`, { refreshToken }).pipe(
      tap((response) => {
        // Store new access token
        this.storeAuthToken(response.accessToken, refreshToken); // Refresh accessToken remains the same
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
