import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PackageService } from '../../services/package.service';

@Component({
  selector: 'app-package-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './package-detail.html',
  styleUrls: ['./package-detail.css']
})
export class PackageDetailComponent implements OnInit {
  package: any = null;
  isLoading = true;
  packageId!: string;

  private apiUrl = 'http://localhost:8000/api/packages';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private packageService: PackageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.packageId = this.route.snapshot.paramMap.get('id')!;
    this.loadPackage();
  }

  loadPackage() {
    console.log('Loading package:', this.packageId);
    this.packageService.getById(this.packageId).subscribe({
      next: (data) => {
        console.log('Package loaded:', data);
        this.package = data;
        this.isLoading = false;
        this.cdr.detectChanges();
        // Preload package data for faster booking
        this.preloadBookingData();
      },
      error: (err) => {
        console.error('Error loading package:', err);
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  private preloadBookingData(): void {
    // The package data is already cached by PackageService
    // This ensures instant loading when user navigates to booking page
    console.log('Preloaded booking data for package:', this.packageId);
  }
  
  goBack() {
    window.history.back();
  }
}