import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

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
  tags?: string[];
}

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blog-detail.html',
  styleUrls: ['./blog-detail.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  blog: BlogPost | null = null;
  relatedBlogs: BlogPost[] = [];
  isLoading: boolean = true;
  error: string = '';
  formattedContent: any[] = [];
  private subscription: Subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const routeSub = this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadBlog(id);
      }
    });
    this.subscription.add(routeSub);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  loadBlog(id: string) {
    this.isLoading = true;
    const blogSub = this.http.get<any>(`http://localhost:8000/api/blogs/${id}`).subscribe({
      next: (response) => {
        this.blog = response.blog || response;
        if (this.blog && this.blog.content) {
          // Use requestIdleCallback for non-critical parsing if available
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => {
              this.parseContent(this.blog!.content);
            });
          } else {
            // Fallback for browsers without requestIdleCallback
            setTimeout(() => {
              this.parseContent(this.blog!.content);
            }, 0);
          }
          this.loadRelatedBlogs(this.blog.category, this.blog._id);
        } else {
          this.error = 'Blog content not found';
        }
        this.isLoading = false;
        window.scrollTo(0, 0);
      },
      error: (err) => {
        console.error('Error loading blog:', err);
        this.error = 'Failed to load blog post';
        this.isLoading = false;
      }
    });
    this.subscription.add(blogSub);
  }

  parseContent(content: string) {
    if (!content) {
      return;
    }
    
    this.formattedContent = [];
    const lines = content.split('\n');
    let currentList: string[] = [];
    let currentParagraph: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        this.formattedContent.push({
          type: 'paragraph',
          text: currentParagraph.join(' ')
        });
        currentParagraph = [];
      }
    };

    const flushList = () => {
      if (currentList.length > 0) {
        this.formattedContent.push({
          type: 'list',
          items: currentList
        });
        currentList = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();

      if (!trimmed) {
        flushParagraph();
        flushList();
        continue;
      }

      // Main heading (##)
      if (trimmed.startsWith('## ')) {
        flushParagraph();
        flushList();
        this.formattedContent.push({
          type: 'heading',
          text: trimmed.substring(3)
        });
      }
      // Subheading (bold **)
      else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
        flushParagraph();
        flushList();
        this.formattedContent.push({
          type: 'subheading',
          text: trimmed.slice(2, -2)
        });
      }
      // List item (-)
      else if (trimmed.startsWith('- ')) {
        flushParagraph();
        currentList.push(trimmed.substring(2));
      }
      // Regular paragraph
      else {
        flushList();
        currentParagraph.push(trimmed);
      }
    }

    flushParagraph();
    flushList();
  }

  loadRelatedBlogs(category: string, currentId: string) {
    const relatedSub = this.http.get<any>(`http://localhost:8000/api/blogs/minimal?category=${category}&limit=4`).subscribe({
      next: (response) => {
        const allBlogs = response.blogs || [];
        this.relatedBlogs = allBlogs
          .filter((b: BlogPost) => b._id !== currentId)
          .slice(0, 3);
      },
      error: (err) => {
        console.error('Error loading related blogs:', err);
      }
    });
    this.subscription.add(relatedSub);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack() {
    this.router.navigate(['/blog']);
  }

  viewBlog(id: string) {
    this.router.navigate(['/blog', id]);
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByBlogId(index: number, blog: BlogPost): string {
    return blog._id;
  }
}
