import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface Destination {
  _id: string;
  name: string;
  location: string;
  image: string;
  description?: string;
  mood?: string[];
  budgetRange?: string;
  bestSeason?: string[];
  travelType?: string[];
  highlights?: string[];
  estimatedBudget?: {
    min: number;
    max: number;
    currency: string;
  };
}

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './destination.html',
  styleUrls: ['./destination.css']
})
export class DestinationComponent implements OnInit {
  destinations: Destination[] = [];
  filteredDestinations: Destination[] = [];
  isLoading: boolean = true;
  isFilterSticky: boolean = false;

  // Filter options
  moodOptions: string[] = ['Adventure', 'Relaxation', 'Cultural', 'Romantic', 'Party', 'Nature', 'Urban', 'Beach'];
  budgetOptions: string[] = ['Budget', 'Mid-Range', 'Luxury'];
  seasonOptions: string[] = ['Spring', 'Summer', 'Fall', 'Winter', 'Year-Round'];
  travelTypeOptions: string[] = ['Solo', 'Couple', 'Family', 'Friends', 'Group'];

  // Selected filters
  selectedMood: string | null = null;
  selectedBudget: string | null = null;
  selectedSeason: string | null = null;
  selectedTravelType: string | null = null;

  // Dropdown states
  showMoodDropdown: boolean = false;
  showBudgetDropdown: boolean = false;
  showSeasonDropdown: boolean = false;
  showTravelTypeDropdown: boolean = false;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadDestinations();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.isFilterSticky = window.pageYOffset > 300;
  }

  loadDestinations() {
    this.isLoading = true;
    this.http.get<Destination[]>('http://localhost:8000/api/destinations').subscribe({
      next: (data) => {
        this.destinations = data;
        this.filteredDestinations = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading destinations:', err);
        this.isLoading = false;
      }
    });
  }

  toggleDropdown(type: string) {
    this.closeAllDropdowns();
    switch(type) {
      case 'mood':
        this.showMoodDropdown = !this.showMoodDropdown;
        break;
      case 'budget':
        this.showBudgetDropdown = !this.showBudgetDropdown;
        break;
      case 'season':
        this.showSeasonDropdown = !this.showSeasonDropdown;
        break;
      case 'travelType':
        this.showTravelTypeDropdown = !this.showTravelTypeDropdown;
        break;
    }
  }

  closeDropdown() {
    this.closeAllDropdowns();
  }

  closeAllDropdowns() {
    this.showMoodDropdown = false;
    this.showBudgetDropdown = false;
    this.showSeasonDropdown = false;
    this.showTravelTypeDropdown = false;
  }

  selectMood(mood: string) {
    this.selectedMood = this.selectedMood === mood ? null : mood;
    this.applyFilters();
    this.closeDropdown();
  }

  selectBudget(budget: string) {
    this.selectedBudget = this.selectedBudget === budget ? null : budget;
    this.applyFilters();
    this.closeDropdown();
  }

  selectSeason(season: string) {
    this.selectedSeason = this.selectedSeason === season ? null : season;
    this.applyFilters();
    this.closeDropdown();
  }

  selectTravelType(type: string) {
    this.selectedTravelType = this.selectedTravelType === type ? null : type;
    this.applyFilters();
    this.closeDropdown();
  }

  applyFilters() {
    this.filteredDestinations = this.destinations.filter(dest => {
      if (this.selectedMood && dest.mood) {
        if (!dest.mood.includes(this.selectedMood)) {
          return false;
        }
      }

      if (this.selectedBudget && dest.budgetRange) {
        if (dest.budgetRange !== this.selectedBudget) {
          return false;
        }
      }

      if (this.selectedSeason && dest.bestSeason) {
        if (!dest.bestSeason.includes(this.selectedSeason) && !dest.bestSeason.includes('Year-Round')) {
          return false;
        }
      }

      if (this.selectedTravelType && dest.travelType) {
        if (!dest.travelType.includes(this.selectedTravelType)) {
          return false;
        }
      }

      return true;
    });
  }

  clearFilters() {
    this.selectedMood = null;
    this.selectedBudget = null;
    this.selectedSeason = null;
    this.selectedTravelType = null;
    this.filteredDestinations = this.destinations;
    this.closeAllDropdowns();
  }

  hasActiveFilters(): boolean {
    return !!(this.selectedMood || this.selectedBudget || this.selectedSeason || this.selectedTravelType);
  }

  viewPackages(destinationName: string) {
    this.router.navigate(['/packages', destinationName]);
  }

  // Icon helpers
  getMoodIcon(mood: string): string {
    const icons: { [key: string]: string } = {
      'Adventure': '⛰️',
      'Relaxation': '🧘',
      'Cultural': '🎭',
      'Romantic': '💕',
      'Party': '🎉',
      'Nature': '🌿',
      'Urban': '🏙️',
      'Beach': '🏖️'
    };
    return icons[mood] || '📍';
  }

  getBudgetIcon(budget: string): string {
    const icons: { [key: string]: string } = {
      'Budget': '💵',
      'Mid-Range': '💰',
      'Luxury': '💎'
    };
    return icons[budget] || '💰';
  }

  getSeasonIcon(season: string): string {
    const icons: { [key: string]: string } = {
      'Spring': '🌸',
      'Summer': '☀️',
      'Fall': '🍂',
      'Winter': '❄️',
      'Year-Round': '🌍'
    };
    return icons[season] || '🌤️';
  }

  getTravelTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Solo': '🎒',
      'Couple': '💑',
      'Family': '👨‍👩‍👧‍👦',
      'Friends': '👥',
      'Group': '👫'
    };
    return icons[type] || '👤';
  }
}
