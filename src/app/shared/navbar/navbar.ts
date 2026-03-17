import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService, User } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.css']
})
export class Navbar implements OnInit {
  isDarkMode = false;
  isMenuOpen = false;
  currentUser: User | null = null;
  showUserMenu = false;
  showSearch = false;
  searchQuery = '';

  bookingCount = 0;
  showBookingMenu = false;

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit() {
    // Load saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      this.isDarkMode = true;
      document.body.classList.add('dark-theme');
    }

    // Subscribe to current user
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        setTimeout(() => {
          this.loadBookingCount();
        }, 0);
      } else {
        this.bookingCount = 0;
      }
    });
  }

  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('dark-theme', this.isDarkMode);
    localStorage.setItem('darkMode', this.isDarkMode.toString());
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showBookingMenu = false;
    }
  }

  toggleBookingMenu() {
    this.showBookingMenu = !this.showBookingMenu;
    if (this.showBookingMenu) {
      this.showUserMenu = false;
    }
  }

  toggleSearch() {
    this.showSearch = !this.showSearch;
    if (!this.showSearch) {
      this.searchQuery = '';
    }
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/packages'], { queryParams: { search: this.searchQuery } });
      this.showSearch = false;
      this.searchQuery = '';
    }
  }

  getUserInitials(): string {
    if (!this.currentUser || !this.currentUser.name) return 'U';
    const names = this.currentUser.name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.currentUser.name.substring(0, 2).toUpperCase();
  }

  loadBookingCount() {
    if (this.currentUser && this.currentUser.id) {
      this.bookingService.getUserBookingCount(this.currentUser.id).subscribe({
        next: (response: { count: number }) => {
          this.bookingCount = response.count;
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 401) {
            this.bookingCount = 0;
          }
          this.bookingCount = 0;
          this.cdr.detectChanges();
        }
      });
    }
  }

  logout() {
    this.authService.logout();
    this.showUserMenu = false;
    this.showBookingMenu = false;
    this.bookingCount = 0;
  }
}