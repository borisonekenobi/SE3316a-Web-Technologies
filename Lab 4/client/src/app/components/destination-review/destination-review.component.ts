import {Component, inject, Input} from '@angular/core';
import {DestinationReview} from '../../destination-review';
import {DestinationService} from '../../destination.service';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'app-destination-review',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    NgOptimizedImage,
  ],
  templateUrl: './destination-review.component.html',
  styleUrl: './destination-review.component.css'
})
export class DestinationReviewComponent {
  @Input() review!: DestinationReview;
  destinationService: DestinationService = inject(DestinationService);
  isAdmin: boolean;

  constructor() {
    const user = JSON.parse(sessionStorage.getItem('user') as string);
    if (!user) this.isAdmin = false;
    else this.isAdmin = user.type === 'admin';
  }

  changeReview() {
    this.review.is_hidden = !this.review.is_hidden;
    this.destinationService.updateDestinationReview(this.review).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }
    });
  }

  getFullStars() {
    return Math.floor(parseInt(this.review.rating) / 2);
  }

  getHalfStars() {
    return parseInt(this.review.rating) % 2 !== 0 ? 1 : 0;
  }

  getEmptyStars() {
    return Math.floor((10 - parseInt(this.review.rating)) / 2);
  }
}
