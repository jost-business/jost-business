import { Injectable, signal } from '@angular/core';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  currentUser = signal<User | null>(null);
  isAuthenticated = signal(false);
  isLoading = signal(false);

  login(email: string, password: string): void {
    this.isLoading.set(true);
    
    // Simulate API call
    setTimeout(() => {
      const user: User = {
        id: '1',
        email,
        name: email.split('@')[0],
        role: 'user',
      };
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.isLoading.set(false);
    }, 500);
  }

  logout(): void {
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
  }

  register(email: string, password: string, name: string): void {
    this.isLoading.set(true);
    
    setTimeout(() => {
      const user: User = {
        id: '1',
        email,
        name,
        role: 'user',
      };
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.isLoading.set(false);
    }, 500);
  }
}
