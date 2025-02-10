import {Component, inject, Input} from '@angular/core';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {ListService} from '../../list.service';
import {ListReview} from '../../list-review';

@Component({
  selector: 'app-list-review',
  standalone: true,
  imports: [
    NgForOf,
    NgOptimizedImage,
    NgIf,
  ],
  templateUrl: './list-review.component.html',
  styleUrl: './list-review.component.css'
})
export class ListReviewComponent {
  @Input() review!: ListReview;
  listService: ListService = inject(ListService);
  isAdmin: boolean;

  constructor() {
    const user = JSON.parse(sessionStorage.getItem('user') as string);
    if (!user) this.isAdmin = false;
    else this.isAdmin = user.type === 'admin';
  }

  changeReview() {
    this.review.is_hidden = !this.review.is_hidden;
    this.listService.updateListReview(this.review).then(r => {
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
