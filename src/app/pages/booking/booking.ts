import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { PackageService } from '../../services/package.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './booking.html',
  styleUrls: ['./booking.css']
})
export class BookingComponent implements OnInit {
  package: any = null;
  packageId: string = '';
  // Performance optimization flags
  isPackageLoaded: boolean = false;
  isGalleryVisible: boolean = false;
  isItineraryVisible: boolean = false;
  customerDetails = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zipCode: ''
  };
  numberOfTravelers: number = 1;
  specialRequests: string = '';
  currentUser: any = null;
  bookingSuccess: boolean = false;
  bookingError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private packageService: PackageService,
    private bookingService: BookingService
  ) {}

  ngOnInit(): void {
    this.packageId = this.route.snapshot.paramMap.get('id')!;
    
    // Check if package ID is provided
    if (!this.packageId) {
      this.bookingError = 'No package ID provided. Please select a package to book.';
      return;
    }
    
    // Load data in parallel for better performance
    this.loadBookingData();
  }

  private loadBookingData(): void {
    // Load package details immediately
    this.loadPackageDetails();
    
    // Load user data
    this.loadUserData();
  }

  private loadPackageDetails(): void {
    this.packageService.getById(this.packageId).subscribe({
      next: (data) => {
        this.package = data;
        this.isPackageLoaded = true;
        // Pre-fill some customer details if available in package
        if (this.package && this.currentUser) {
          this.prefillCustomerDetails();
        }
      },
      error: (err) => {
        console.error('Error loading package:', err);
        this.bookingError = 'Failed to load package details. Please try again.';
      }
    });
  }

  private loadUserData(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        // Pre-fill email from user profile
        this.customerDetails.email = user.email;
        // If package is already loaded, prefill other details
        if (this.package) {
          this.prefillCustomerDetails();
        }
      }
    });
  }

  private prefillCustomerDetails(): void {
    // Prefill customer details from user profile if available
    if (this.currentUser && this.currentUser.name) {
      const nameParts = this.currentUser.name.split(' ');
      if (nameParts.length >= 2) {
        this.customerDetails.firstName = nameParts[0];
        this.customerDetails.lastName = nameParts.slice(1).join(' ');
      } else {
        this.customerDetails.firstName = this.currentUser.name;
        this.customerDetails.lastName = '';
      }
    }
    
    if (this.currentUser && this.currentUser.phone) {
      this.customerDetails.phone = this.currentUser.phone;
    }
  }

  calculateTotal(): number {
    if (!this.package?.price?.amount) return 0;
    return Number(this.package.price.amount) * this.numberOfTravelers;
  }

  submitBooking() {
    console.log('Submit booking called');
    console.log('Current user:', this.currentUser);
    console.log('Package:', this.package);
    
    if (!this.validateForm()) {
      console.log('Form validation failed');
      return;
    }

    if (!this.currentUser) {
      this.bookingError = 'You must be logged in to book a package';
      console.log('User not authenticated');
      // Redirect to login page
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }
    
    if (!this.package) {
      this.bookingError = 'Package data is not available. Please go back and select the package again.';
      console.log('Package not available');
      return;
    }

    const bookingData = {
      userId: this.currentUser.id,
      userEmail: this.currentUser.email,
      packageName: this.package.packageName,
      destination: this.package.destination,
      packageDetails: {
        packageName: this.package.packageName,
        destination: this.package.destination,
        duration: this.package.duration,
        packageType: this.package.packageType,
        price: this.package.price,
        heroImage: this.package.heroImage,
        gallery: this.package.gallery,
        inclusions: this.package.inclusions,
        exclusions: this.package.exclusions,
        accommodation: this.package.accommodation,
        transportAndTransfer: this.package.transportAndTransfer,
        meals: this.package.meals,
        itinerary: this.package.itinerary,
        averageRating: this.package.averageRating,
        userReviews: this.package.userReviews
      },
      customerDetails: this.customerDetails,
      numberOfTravelers: this.numberOfTravelers,
      specialRequests: this.specialRequests,
      totalAmount: this.calculateTotal()
    };

    console.log('Submitting booking data:', bookingData);
    
    // Submit booking to backend
    this.bookingService.createBooking(bookingData).subscribe({
      next: (data) => {
        console.log('Booking successful:', data);
        this.bookingSuccess = true;
        this.bookingError = '';
        // Navigate to booking confirmation page with the booking ID
        setTimeout(() => {
          this.router.navigate(['/booking-confirmation', data._id]);
        }, 1000); // Reduced timeout for faster redirect
      },
      error: (error) => {
        console.error('Booking error:', error);
        if (error.status === 401) {
          this.bookingError = 'Session expired. Please log in again.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        } else {
          this.bookingError = 'Failed to book package. Please try again.';
        }
      }
    });
  }

  validateForm(): boolean {
    if (!this.customerDetails.firstName || !this.customerDetails.lastName ||
        !this.customerDetails.email || !this.customerDetails.phone ||
        !this.customerDetails.address || !this.customerDetails.city ||
        !this.customerDetails.country || !this.customerDetails.zipCode) {
      this.bookingError = 'Please fill in all required fields';
      return false;
    }

    if (this.numberOfTravelers < 1) {
      this.bookingError = 'Number of travelers must be at least 1';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.customerDetails.email)) {
      this.bookingError = 'Please enter a valid email address';
      return false;
    }

    return true;
  }

  goBack() {
    window.history.back();
  }

  isBookingEnabled(): boolean {
    return !!this.currentUser && !!this.package && this.isValidForm();
  }

  isValidForm(): boolean {
    // Check if all required customer details are filled
    const requiredFields = [
      this.customerDetails.firstName,
      this.customerDetails.lastName,
      this.customerDetails.email,
      this.customerDetails.phone,
      this.customerDetails.address,
      this.customerDetails.city,
      this.customerDetails.country,
      this.customerDetails.zipCode
    ];
    
    const allFieldsFilled = requiredFields.every(field => field && field.trim() !== '');
    
    if (!allFieldsFilled) {
      return false;
    }
    
    // Also check if number of travelers is valid
    if (this.numberOfTravelers < 1) {
      return false;
    }
    
    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.customerDetails.email)) {
      return false;
    }
    
    return true;
  }

  // Lazy loading methods for performance
  showGallery(): void {
    this.isGalleryVisible = true;
  }

  showItinerary(): void {
    this.isItineraryVisible = true;
  }

  // TrackBy functions for better performance
  trackByIndex(index: number): number {
    return index;
  }

  trackById(index: number, item: any): string {
    return item._id || index;
  }
}