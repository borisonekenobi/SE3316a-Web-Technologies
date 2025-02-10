import {Component, inject} from '@angular/core';
import {UserService} from '../../user.service';
import {ActivatedRoute} from '@angular/router';
import {NgIf} from '@angular/common';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './verify-email.page.html',
  styleUrl: './verify-email.page.css'
})
export class VerifyEmailPage {
  private route: ActivatedRoute = inject(ActivatedRoute);
  private userService: UserService = inject(UserService);
  message: string = 'Verifying...';

  constructor() {
    this.userService.verify(this.route.snapshot.params['id']).then(r => {
      if ('message' in r) {
        this.message = r.message;
        return;
      }
    });
  }
}
