import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  createdAt: string;
  category: string;
  readTime: string;
  views?: number;
}

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog.html',
  styleUrls: ['./blog.css']
})
export class BlogComponent implements OnInit {
  blogPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  selectedCategory: string = 'All';
  categories: string[] = ['All', 'Travel Tips', 'Romance', 'Culture', 'Adventure', 'Europe', 'Asia'];
  isLoading: boolean = true;
  error: string = '';

  constructor(
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBlogs();
  }

  loadBlogs() {
    this.isLoading = true;
    this.http.get<any>('http://localhost:8000/api/blogs/minimal').subscribe({
      next: (response) => {
        this.blogPosts = response.blogs || [];
        this.filteredPosts = this.blogPosts;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading blogs:', err);
        this.error = 'Failed to load blog posts';
        this.isLoading = false;
      }
    });
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'All') {
      this.filteredPosts = this.blogPosts;
    } else {
      this.filteredPosts = this.blogPosts.filter(post => post.category === category);
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  viewBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }
}
