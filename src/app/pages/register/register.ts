import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent implements OnInit {
  user = {
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };
  showPassword = false;
  showConfirmPassword = false;
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // If user is already logged in, redirect to profile
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/profile']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  register(): void {
    // Validation
    if (!this.user.name || !this.user.email || !this.user.phone || !this.user.password) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    if (this.user.password !== this.user.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.user.email)) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    // Phone validation (basic)
    if (this.user.phone.length < 10) {
      this.errorMessage = 'Please enter a valid phone number';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.user).subscribe({
      next: (response: any) => {
        if (response.success && response.token && response.user) {
          // Store the token and user data
          this.authService.setUserData(response.token, response.user);
          this.loading = false;
          this.router.navigate(['/profile']);
        } else {
          this.loading = false;
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
        console.error('Registration error:', error);
      }
    });
  }

  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}