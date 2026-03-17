import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css']
})
export class Footer implements OnInit {
  newsletterEmail = '';
  showBackToTop = false;

  ngOnInit() {
    // Initialize any footer-specific logic
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    // Show back to top button when scrolled down 300px
    this.showBackToTop = window.pageYOffset > 300;
  }

  subscribeNewsletter() {
    if (this.newsletterEmail && this.validateEmail(this.newsletterEmail)) {
      alert(`Thank you for subscribing with: ${this.newsletterEmail}`);
      this.newsletterEmail = '';
    } else {
      alert('Please enter a valid email address');
    }
  }

  validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
