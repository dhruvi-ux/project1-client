import { Component, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  templateUrl: './about.html',
  styleUrls: ['./about.css']
})
export class About implements AfterViewInit {

  stats = [
    { label: 'Destinations', value: 500, display: 0 },
    { label: 'Happy Travelers', value: 10000, display: 0 },
    { label: 'Support Hours', value: 24, display: 0 }
  ];

  team = [
    {
      name: 'Aarav Mehta',
      role: 'Founder & Travel Expert',
      image: 'https://randomuser.me/api/portraits/men/32.jpg'
    },
    {
      name: 'Riya Sharma',
      role: 'Trip Planner',
      image: 'https://randomuser.me/api/portraits/women/44.jpg'
    },
    {
      name: 'Kabir Patel',
      role: 'Operations Manager',
      image: 'https://randomuser.me/api/portraits/men/55.jpg'
    }
  ];

  destinations = [
    {
      name: 'Bali, Indonesia',
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e'
    },
    {
      name: 'Paris, France',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34'
    },
    {
      name: 'Dubai, UAE',
      image: 'https://images.unsplash.com/photo-1526495124232-a04e1849168c'
    },
    {
      name: 'Switzerland',
      image: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470'
    }
  ];

  ngAfterViewInit() {
    this.animateCounters();
  }

  animateCounters() {
    this.stats.forEach(stat => {
      let current = 0;
      const step = Math.ceil(stat.value / 80);

      const timer = setInterval(() => {
        current += step;
        if (current >= stat.value) {
          stat.display = stat.value;
          clearInterval(timer);
        } else {
          stat.display = current;
        }
      }, 20);
    });
  }
}
