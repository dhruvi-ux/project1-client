import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadCurrentUser();
  }

  private loadCurrentUser() {
    const token = localStorage.getItem('userToken');
    if (token) {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      }
    }
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/login`, credentials).pipe(
      // Handle the response from the backend
    );
  }

  register(userData: { name: string; email: string; phone: string; password: string }): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData).pipe(
      // Handle the response from the backend
    );
  }

  setUserData(token: string, user: User) {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('userToken');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
}