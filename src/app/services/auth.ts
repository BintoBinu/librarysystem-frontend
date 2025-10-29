import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token?: string;
  username?: string;
  role?: string;
  id?: number; // optional userId from backend
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = 'http://localhost:8080/api/auth';
  private currentUserSubject = new BehaviorSubject<LoginResponse | null>(null);

  constructor(private http: HttpClient, private router: Router) {
    if (this.isBrowser()) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  // ✅ Ensure this runs in a browser
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  // ✅ Register new user
  register(data: { username: string; password: string; role: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, data);
  }

  // ✅ Login user & save info locally
  login(data: { username: string; password: string }): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/login`, data).pipe(
      tap(res => {
        if (res.token && this.isBrowser()) {
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res));
          this.currentUserSubject.next(res);
        }
      })
    );
  }

  // ✅ Logout completely
  logout(): void {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.currentUserSubject.next(null);
    this.router.navigate(['/']);
  }

  // ✅ Token getter
  get token(): string | null {
    return this.isBrowser() ? localStorage.getItem('token') : null;
  }

  // ✅ Get current user info
  get currentUser(): LoginResponse | null {
    return this.currentUserSubject.value;
  }

  // ✅ Is user logged in?
  isLoggedIn(): boolean {
    return !!this.token;
  }

  // ✅ Role getter
  getUserRole(): string | null {
    return this.currentUser?.role ?? null;
  }

  // ✅ Decode JWT payload safely
  private decodeToken(): any {
    const token = this.token;
    if (!token) return null;

    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch (e) {
      console.error('Error decoding token:', e);
      return null;
    }
  }

  // ✅ Get username (from token or local user)
  getUsername(): string | null {
    const decoded = this.decodeToken();
    return decoded?.sub || this.currentUser?.username || null;
  }

  // ✅ Get userId — fallback to username if missing
  getUserId(): number | string | null {
    const decoded = this.decodeToken();
    if (decoded?.userId) return decoded.userId; // if backend adds userId in token

    // check stored user
    const storedUser = this.isBrowser() ? localStorage.getItem('user') : null;
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        return parsed.id || parsed.userId || parsed.username || null; // ✅ fallback to username
      } catch {
        return null;
      }
    }

    // fallback to decoded username
    return decoded?.sub || null;
  }
}
