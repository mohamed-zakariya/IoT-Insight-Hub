import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../models/user';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = 'http://localhost:3000/api';
  private http = inject(HttpClient);

  // BehaviorSubject to hold and share user data
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  constructor() {
    // Load user from localStorage if available
    if (this.isBrowser) {
      this.loadUserFromStorage();
    }
  }

  /** Load user from token in localStorage */
  private loadUserFromStorage() {
    const token = this.getAuthToken();
    if (token) {
      const user = this.decodeToken(token);
      this.setUser(user);
    }
  }

  /** Save token to localStorage */
  private storeAuthToken(token: string) {
    if (this.isBrowser) {
      localStorage.setItem('auth_token', token);
    }
  }

  /** Retrieve token from localStorage */
  private getAuthToken(): string | null {
    return this.isBrowser ? localStorage.getItem('auth_token') : null;
  }

  /** Decode JWT payload (basic method) */
  private decodeToken(token: string): User {
    try {
      const payload = atob(token.split('.')[1]);
      return JSON.parse(payload);
    } catch (err) {
      console.error('Failed to decode token', err);
      return {} as User;
    }
  }

  /** Store user in BehaviorSubject */
  setUser(user: User) {
    this.currentUserSubject.next(user);
  }

  /** Clear user and token */
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('auth_token');
    }
    this.currentUserSubject.next(null);
  }

  /** Login and set token + user */
  login(user: User): Observable<any> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, user).pipe(
      tap((response) => {
        this.storeAuthToken(response.token);
        const user = this.decodeToken(response.token);
        this.setUser(user);
      })
    );
  }

  /** Add token to request headers */
  private addAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  /** Example: protected GET request */
  someProtectedRequest(): Observable<any> {
    return this.http.get(`${this.apiUrl}/protected-endpoint`, {
      headers: this.addAuthHeaders(),
    });
  }


   /** Check if the user is null and try to load it from localStorage */
   checkCurrentUser(): User | null {
    let user = this.currentUserSubject.getValue();
    if (!user) {
      this.loadUserFromStorage();
      user = this.currentUserSubject.getValue(); // Fetch user from BehaviorSubject after loading from localStorage
    }
    return user;
  }
}
