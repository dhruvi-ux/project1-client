import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register-modal.html',
  styleUrls: ['./register-modal.css']
})
export class RegisterModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() switchToLogin = new EventEmitter<void>();
  
  name = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  onSubmit() {
    this.errorMessage = '';
    
    // Validation
    if (!this.name || !this.email || !this.phone || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters long';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    // Phone validation
    if (!/^[0-9]{10,15}$/.test(this.phone)) {
      this.errorMessage = 'Please enter a valid phone number (10-15 digits)';
      return;
    }

    this.isLoading = true;

    this.authService.register({name: this.name, email: this.email, phone: this.phone, password: this.password}).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.close.emit();
        } else {
          this.errorMessage = response.message;
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  onClose() {
    this.close.emit();
  }

  onSwitchToLogin() {
    this.switchToLogin.emit();
  }
}
