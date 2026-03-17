import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  private API_URL = 'http://localhost:8000/api/bookings';

  constructor(private http: HttpClient) {}

  // Create a new booking
  createBooking(bookingData: any): Observable<any> {
    const token = localStorage.getItem('userToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.post(`${this.API_URL}`, bookingData, { headers });
  }

  // Get all bookings (for admin) with pagination
  getAllBookings(page: number = 1, limit: number = 10): Observable<{ bookings: any[], pagination: any }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    });
    return this.http.get<{ bookings: any[], pagination: any }>
      (`${this.API_URL}?page=${page}&limit=${limit}`, { headers });
  }

  // Get bookings by user with pagination (FULL DATA - use only when needed)
  getUserBookings(userId: string, page: number = 1, limit: number = 10): Observable<{ bookings: any[], pagination: any }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('userToken')}`
    });
    return this.http.get<{ bookings: any[], pagination: any }>
      (`${this.API_URL}/user/${userId}?page=${page}&limit=${limit}`, { headers });
  }

  // 🔥 NEW: Get bookings by user with MINIMAL data (optimized for list view)
  getUserBookingsMinimal(userId: string, page: number = 1, limit: number = 10): Observable<{ bookings: any[], pagination: any }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('userToken')}`
    });
    return this.http.get<{ bookings: any[], pagination: any }>
      (`${this.API_URL}/user/${userId}/minimal?page=${page}&limit=${limit}`, { headers });
  }

  // Get single booking
  getBooking(bookingId: string): Observable<any> {
    const token = localStorage.getItem('userToken');
    
    if (!token) {
      return new Observable(observer => {
        observer.error({ status: 401, message: 'No authentication token found' });
      });
    }
    
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    
    return this.http.get<any>(`${this.API_URL}/${bookingId}`, { headers });
  }

  // Update booking status (for admin)
  updateBookingStatus(bookingId: string, status: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    });
    return this.http.put(`${this.API_URL}/${bookingId}/status`, { status }, { headers });
  }

  // Delete booking (for admin)
  deleteBooking(bookingId: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
    });
    return this.http.delete(`${this.API_URL}/${bookingId}`, { headers });
  }

  // Get booking count for user (optimized)
  getUserBookingCount(userId: string): Observable<{ count: number }> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('userToken')}`
    });
    return this.http.get<{ count: number }>(`${this.API_URL}/count/${userId}`, { headers });
  }
}