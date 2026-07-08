import { Component, afterNextRender } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './layout/navbar/navbar';
import { fallbackIcon } from './core/icon-url';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor() {
    afterNextRender(() => {
      document.addEventListener('error', (e) => {
        const target = e.target as HTMLImageElement | undefined;
        if (target?.tagName === 'IMG' && target.src.startsWith('https://render.albiononline.com')) {
          target.src = fallbackIcon();
        }
      }, true);
    });
  }
}
