import {Component} from '@angular/core';
import {RouterLink, RouterOutlet} from '@angular/router';
import {NgIf, NgOptimizedImage} from '@angular/common';
import {User} from './user';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, NgOptimizedImage],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title: string = 'client';
  protected user: User | null = sessionStorage.getItem('user') ? JSON.parse(sessionStorage.getItem('user') as string) : null;
  protected readonly document = document;
}
