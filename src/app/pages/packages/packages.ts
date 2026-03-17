import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { PackageService } from '../../services/package.service';

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packages.html',
  styleUrls: ['./packages.css']
})
export class Packages implements OnInit {

  destination!: string;
  packages: any[] = [];

  constructor(
    private route: ActivatedRoute,
    private packageService: PackageService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.destination = this.route.snapshot.paramMap.get('destination') || '';
    this.loadPackages();
  }

  loadPackages() {
    if (this.destination) {
      // Load packages for specific destination
      this.packageService
        .getByDestination(this.destination)
        .subscribe({
          next: (data) => {
            this.packages = data as any[];
            this.cdr.detectChanges();
          },
          error: (err) => {
            console.error('Error loading packages:', err);
          }
        });
    } else {
      // Load all packages if no destination specified
      this.loadAllPackages();
    }
  }

  loadAllPackages() {
    // Load all packages from the service
    this.packageService.getAll().subscribe({
      next: (data) => {
        this.packages = data;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading all packages:', err);
      }
    });
  }
}
