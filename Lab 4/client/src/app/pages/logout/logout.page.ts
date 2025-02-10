import {Component, inject} from '@angular/core';
import {UserService} from '../../user.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [],
  templateUrl: './logout.page.html',
  styleUrl: './logout.page.css'
})
export class LogoutPage {
  private userService: UserService = inject(UserService);

  constructor() {
    this.userService.logout();
    window.location.href = '/';
  }
}
