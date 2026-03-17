import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, TitleCasePipe } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, TitleCasePipe],
  templateUrl: './booking-confirmation.html',
  styleUrls: ['./booking-confirmation.css']
})
export class BookingConfirmationComponent implements OnInit {

  booking: any = null;
  bookingId = '';
  currentUser: any = null;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.bookingId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.bookingId) {
      this.error = 'Invalid booking confirmation link';
      this.isLoading = false;
      return;
    }

    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
        return;
      }

      this.currentUser = user;
      this.loadBookingDetails();
    });
  }

  private loadBookingDetails(): void {
    this.isLoading = true;

    this.bookingService.getBooking(this.bookingId).subscribe({
      next: (res: any) => {
        /**
         * 🔥 IMPORTANT FIX
         * Backend returns: { booking: {...} }
         */
        const bookingData = res.booking || res;

        /**
         * 🔥 NORMALIZE DATA FOR TEMPLATE
         */
        this.booking = {
          ...bookingData,
          packageDetails: bookingData.packageDetails || bookingData.package,
          customerDetails: bookingData.customerDetails || bookingData.user
        };

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        if (err.status === 401) {
          this.error = 'Session expired. Please login again.';
          this.router.navigate(['/login']);
        } else if (err.status === 403) {
          this.error = 'You are not authorized to view this booking.';
        } else if (err.status === 404) {
          this.error = 'Booking not found.';
        } else {
          this.error = 'Failed to load booking details.';
        }
        this.isLoading = false;
      }
    });
  }

  printConfirmation(): void {
    window.print();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  }
}
