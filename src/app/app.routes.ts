import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { DestinationComponent } from './pages/destination/destination';
import { Packages } from './pages/packages/packages';
import { PackageDetailComponent } from './pages/package-detail/package-detail';
import { About } from './pages/about/about';
import { Contact } from './pages/contact/contact';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { ProfileComponent } from './pages/profile/profile';
import { BookingComponent } from './pages/booking/booking';
import { BookingConfirmationComponent } from './pages/booking-confirmation/booking-confirmation';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';
import { BlogComponent } from './pages/blog/blog';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'destination', component: DestinationComponent },
  { path: 'packages', component: Packages },
  { path: 'packages/:destination', component: Packages },
  { path: 'blog', component: BlogComponent },
  { 
    path: 'blog/:id', 
    loadComponent: () => import('./pages/blog-detail/blog-detail').then(m => m.BlogDetailComponent)
  },
  { path: 'package/:id', component: PackageDetailComponent },
  { path: 'about', component: About },
  { path: 'contact', component: Contact },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'book/:id', component: BookingComponent },
  { path: 'booking-confirmation/:id', component: BookingConfirmationComponent },
  { path: 'my-bookings', component: MyBookingsComponent }
];