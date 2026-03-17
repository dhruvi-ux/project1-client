import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PackageService {
  private API = 'http://localhost:8000/api/packages';
  private cache = new Map<string, any>();
  private cacheTimeout = 5 * 60 * 1000; // 5 minutes cache

  constructor(private http: HttpClient) {}

  getByDestination(destination: string) {
    return this.http.get<any>(`${this.API}/destination/${destination}`).pipe(
      map((response: any) => {
        // Handle both array and paginated formats
        return Array.isArray(response) ? response : (response.packages || []);
      }),
      catchError(error => {
        console.error('Error fetching packages by destination:', error);
        throw error;
      })
    );
  }

  getById(id: string) {
    const cacheKey = `package_${id}`;
    
    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < this.cacheTimeout) {
        return of(cached.data);
      } else {
        // Remove expired cache
        this.cache.delete(cacheKey);
      }
    }
    
    // Fetch from API and cache the result
    return this.http.get(`${this.API}/${id}`).pipe(
      map(data => {
        // Cache the response
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now()
        });
        return data;
      }),
      shareReplay(1),
      catchError(error => {
        console.error('Package service error:', error);
        throw error;
      })
    );
  }

  getAll() {
    return this.http.get<any[]>(`${this.API}`).pipe(
      map((response: any) => {
        // Handle both array and object formats
        return Array.isArray(response) ? response : (response.packages || []);
      }),
      catchError(error => {
        console.error('Error fetching packages:', error);
        throw error;
      })
    );
  }
}
