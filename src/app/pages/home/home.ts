import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  searchDestination = '';
  searchDate = '';
  searchGuests = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Initialize home page
  }

  performSearch() {
    if (this.searchDestination || this.searchDate || this.searchGuests) {
      this.router.navigate(['/packages'], {
        queryParams: {
          destination: this.searchDestination,
          date: this.searchDate,
          guests: this.searchGuests
        }
      });
    } else {
      this.router.navigate(['/packages']);
    }
  }
}
