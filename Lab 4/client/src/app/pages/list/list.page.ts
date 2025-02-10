import {Component, inject} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {List} from '../../list';
import {ListService} from '../../list.service';
import {ListReviewComponent} from '../../components/list-review/list-review.component';
import {DestinationComponent} from '../../components/destination/destination.component';
import {ListReview} from '../../list-review';
import {User} from '../../user';

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    NgForOf,
    ListReviewComponent,
    DestinationComponent,
    NgIf,
  ],
  templateUrl: './list.page.html',
  styleUrl: './list.page.css'
})
export class ListPage {
  route: ActivatedRoute = inject(ActivatedRoute);
  listService: ListService = inject(ListService);
  list: List | undefined;
  isCurrentUser: boolean = false;
  rating: number = 10;
  user: User | null;
  userHasReviewed: boolean = false;

  constructor(titleService: Title) {
    this.user = JSON.parse(sessionStorage.getItem('user') as string);

    const id = this.route.snapshot.params['id'];
    this.listService.getList(id).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.list = r;
      this.userHasReviewed = this.list.reviews.some(review => review.user.id === this.user?.id);
      this.isCurrentUser = this.user?.id === this.list.user.id;
      titleService.setTitle(`${this.list.name} - Destination Picker`);
      this.loadMap();
    });
  }

  loadMap() {
    if (!this.list) return;
    if (this.list.destinations.length === 0) return;

    let avgLat = 0;
    let avgLong = 0;
    this.list.destinations.forEach(destination => {
      avgLat += parseFloat(destination.latitude);
      avgLong += parseFloat(destination.longitude);
    });

    avgLat /= this.list.destinations.length;
    avgLong /= this.list.destinations.length;

    // @ts-ignore
    new ol.Map({
      target: 'map', layers: [
        // @ts-ignore
        new ol.layer.Tile({
          // @ts-ignore
          source: new ol.source.OSM(),
        })], // @ts-ignore
      view: new ol.View({
        // @ts-ignore
        center: ol.proj.fromLonLat(
            [avgLong, avgLat]), zoom: 4,
      }),
    });
  }

  validateName() {
    const nameElement = document.getElementById('list-name') as HTMLInputElement;
    if (!nameElement) return;

    if (nameElement.value.length === 0) {
      nameElement.classList.add('is-invalid');
    } else {
      nameElement.classList.remove('is-invalid');
    }
  }

  updateList() {
    if (!this.list) return;

    this.validateName();
    const nameElement = document.getElementById('list-name') as HTMLInputElement;
    const descriptionElement = document.getElementById('list-description') as HTMLInputElement;
    const privateElement = document.getElementById('list-private') as HTMLInputElement;

    if (nameElement?.value.length === 0) return;

    this.list.name = nameElement.value
    this.list.description = descriptionElement.value
    this.list.is_private = privateElement.checked;

    this.listService.updateList(this.list).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }
    });
  }

  setRating() {
    const rating = document.getElementById('rating') as HTMLInputElement;
    const ratingText = document.getElementById('rating-text') as HTMLParagraphElement;
    if (!rating) return;
    this.rating = parseInt(rating?.value);
    if (ratingText) ratingText.textContent = `${this.rating / 2} / 5`;
  }

  addReview() {
    this.setRating();

    const commentElement = document.getElementById('comment')! as HTMLInputElement;

    const review: ListReview = {
      list_id: this.list?.id || '',
      user: this.user!,
      rating: this.rating.toString(),
      comment: commentElement.value || '',
      is_hidden: false
    }

    this.listService.addReviewToList(review).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }

      if (!this.list) return;
      this.list.reviews.push(review);
      this.userHasReviewed = true;
    });
  }
}
