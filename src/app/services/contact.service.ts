import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:8000/api/contacts';

  constructor(private http: HttpClient) {}

  // Get all contacts for a user
  getUserContacts(userId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user/${userId}`);
  }

  // Create a new contact inquiry
  createContact(userId: string, subject: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/user/${userId}`, {
      subject,
      message
    });
  }

  // Get a single contact
  getContact(contactId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${contactId}`);
  }

  // Admin: Reply to a contact inquiry
  replyToContact(contactId: string, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${contactId}/reply`, {
      message
    });
  }

  // Admin: Get all contacts
  getAllContacts(page: number = 1, limit: number = 10, status?: string): Observable<any> {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    return this.http.get(url);
  }

  // Admin: Mark contact as resolved
  resolveContact(contactId: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${contactId}/resolve`, {});
  }

  // Delete a contact
  deleteContact(contactId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${contactId}`);
  }
}
