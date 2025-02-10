import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [],
  templateUrl: './about.page.html',
  styleUrl: './about.page.css'
})
export class AboutPage {
  pspOpen: boolean = false;
  dmcaOpen: boolean = false;
  aupOpen: boolean = false;
}
