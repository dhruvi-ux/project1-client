import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html',
  styleUrls: ['./contact.css']
})
export class Contact {
  contactData = {
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  };

  isLoading = false;
  successMessage = '';
  errorMessage = '';

  private apiUrl = 'http://localhost:8000/api/contacts';

  constructor(private http: HttpClient, private authService: AuthService) {}

  submitForm() {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    const currentUser = this.authService.getCurrentUser();

    const requestData: any = {
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone,
      subject: this.contactData.subject,
      message: this.contactData.message
    };

    // attach userId if logged in so it shows in profile
    if (currentUser?.id) {
      requestData.userId = currentUser.id;
    }

    this.http.post<any>(this.apiUrl, requestData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = response.message;
          // Reset form
          this.contactData = {
            name: '',
            email: '',
            phone: '',
            subject: 'General Inquiry',
            message: ''
          };
        } else {
          this.errorMessage = response.message || 'Error sending message';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Error sending message';
        console.error('Contact error:', error);
        console.error('Error details:', error.error); // shows exact backend message
      }
    });
  }
}
