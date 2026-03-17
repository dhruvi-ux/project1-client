import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './my-bookings.html',
  styleUrls: ['./my-bookings.css']
})
export class MyBookingsComponent implements OnInit {

  bookings: any[] = [];
  currentUser: any = null;
  isLoading = true;
  isLoadingDetails = false; // Separate loading state for modal
  error: string | null = null;
  showBookingModal = false;
  currentBooking: any = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalBookings = 0;
  totalPages = 0;
  Math = Math;

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        // User is not logged in, redirect to login
        this.error = 'Please log in to view your bookings.';
        this.isLoading = false;
        return;
      }

      this.currentUser = user;
      this.loadUserBookings();
    });
  }

  loadUserBookings(page: number = 1): void {
    if (this.currentUser && this.currentUser.id) {
      this.isLoading = true;
      this.currentPage = page;
      
      // 🔥 Use MINIMAL endpoint for faster loading
      this.bookingService.getUserBookingsMinimal(this.currentUser.id, page, this.pageSize).subscribe({
        next: (response: any) => {
          const bookingsArray = response?.bookings || [];
          const pagination = response?.pagination || {};
          
          this.totalBookings = pagination.total || 0;
          this.totalPages = pagination.pages || 0;
          
          // Store minimal data for card display
          this.bookings = bookingsArray.map((booking: any) => ({
            _id: booking._id,
            packageName: booking.packageName || 'N/A',
            destination: booking.destination || 'N/A',
            numberOfTravelers: booking.numberOfTravelers || 1,
            status: booking.status || 'pending',
            totalAmount: booking.totalAmount || 0,
            bookingDate: booking.bookingDate || booking.createdAt,
            createdAt: booking.createdAt,
            packageDetails: {
              duration: {
                days: booking.packageDetails?.duration?.days || 0,
                nights: booking.packageDetails?.duration?.nights || 0,
              }
            },
            customerDetails: {
              firstName: booking.customerDetails?.firstName || 'N/A',
              lastName: booking.customerDetails?.lastName || '',
              email: booking.customerDetails?.email || 'N/A',
              phone: booking.customerDetails?.phone || 'N/A'
            }
          }));
          
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading user bookings:', err);
          this.error = 'Failed to load bookings: ' + (err?.error?.message || err?.message || 'Unknown error');
          if (err.status === 401) {
            this.authService.logout();
            this.error = 'Session expired. Please log in again.';
          }
          this.isLoading = false;
        }
      });
    } else {
      this.error = 'User not found. Please log in again.';
      this.isLoading = false;
    }
  }

  // 🔥 Load full booking details only when clicking View Details
  loadBookingDetails(bookingId: string): void {
    this.showBookingModal = true;
    this.isLoadingDetails = true;
    this.currentBooking = null;
    
    this.bookingService.getBooking(bookingId).subscribe({
      next: (booking: any) => {
        this.currentBooking = {
          ...booking,
          packageName: booking.packageName || 'N/A',
          destination: booking.destination || 'N/A',
          packageDetails: {
            packageName: booking.packageDetails?.packageName || booking.packageName || 'N/A',
            destination: booking.packageDetails?.destination || booking.destination || 'N/A',
            duration: {
              days: booking.packageDetails?.duration?.days || 0,
              nights: booking.packageDetails?.duration?.nights || 0,
            },
            packageType: booking.packageDetails?.packageType || 'N/A',
            price: {
              amount: booking.packageDetails?.price?.amount || 0,
              currency: booking.packageDetails?.price?.currency || 'INR',
            },
            accommodation: booking.packageDetails?.accommodation || 'N/A',
            transportAndTransfer: booking.packageDetails?.transportAndTransfer || 'N/A',
            meals: booking.packageDetails?.meals || 'N/A',
          },
          numberOfTravelers: booking.numberOfTravelers || 1,
          specialRequests: booking.specialRequests || '',
          status: booking.status || 'pending',
          totalAmount: booking.totalAmount || 0,
          bookingDate: booking.bookingDate || booking.createdAt,
          customerDetails: {
            firstName: booking.customerDetails?.firstName || 'N/A',
            lastName: booking.customerDetails?.lastName || '',
            email: booking.customerDetails?.email || 'N/A',
            phone: booking.customerDetails?.phone || 'N/A',
            address: booking.customerDetails?.address || 'N/A',
            city: booking.customerDetails?.city || 'N/A',
            country: booking.customerDetails?.country || 'N/A',
            zipCode: booking.customerDetails?.zipCode || 'N/A'
          }
        };
        
        this.isLoadingDetails = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading booking details:', err);
        this.showBookingModal = false;
        this.isLoadingDetails = false;
        alert('Failed to load booking details');
      }
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'confirmed':
        return '#22c55e';
      case 'cancelled':
        return '#ef4444';
      case 'pending':
        return '#f97316';
      default:
        return '#6b7280';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  }

  trackByBookingId(index: number, booking: any): string {
    return booking._id || index.toString();
  }

  viewBookingDetails(booking: any): void {
    this.loadBookingDetails(booking._id);
  }

  closeBookingModal(): void {
    this.showBookingModal = false;
    this.currentBooking = null;
  }

  // Pagination methods
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.loadUserBookings(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.loadUserBookings(this.currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.loadUserBookings(this.currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }
}