import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CambiarTemaService {

  constructor() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
      savedTheme === 'dark' ? this.enableDarkMode() : this.enableLightMode();
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      this.enableDarkMode();
    } else {
      this.enableLightMode();
    }
  }

  enableDarkMode() {
    localStorage.setItem('theme', 'dark');
    let html = document.querySelector('html');

    html?.classList.add('dark');
    html?.setAttribute('data-bs-theme', 'dark');
  }

  enableLightMode() {
    localStorage.setItem('theme', 'light');

    let html = document.querySelector('html');

    html?.classList.add('light');
    html?.setAttribute('data-bs-theme', 'light');
    
  }

  toggleTheme() {
    let html = document.querySelector('html');
    if (html?.getAttribute('data-bs-theme') == "dark") {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
    location.reload();
  }
}
