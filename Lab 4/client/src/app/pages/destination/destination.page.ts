import {Component, inject} from '@angular/core';
import {Destination} from '../../destination';
import {DestinationService} from '../../destination.service';
import {ActivatedRoute} from '@angular/router';
import {NgForOf, NgIf} from '@angular/common';
import {Title} from '@angular/platform-browser';
import {User} from '../../user';
import {List} from '../../list';
import {UserService} from '../../user.service';
import {ListService} from '../../list.service';
import {DestinationReviewComponent} from '../../components/destination-review/destination-review.component';
import {DestinationReview} from '../../destination-review';

@Component({
  selector: 'app-destination',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    DestinationReviewComponent,
  ],
  templateUrl: './destination.page.html',
  styleUrl: './destination.page.css',
})
export class DestinationPage {
  route: ActivatedRoute = inject(ActivatedRoute);
  destinationService: DestinationService = inject(DestinationService);
  userService: UserService = inject(UserService);
  listService: ListService = inject(ListService);
  destination: Destination | undefined;
  user: User | undefined;
  lists: List[] = [];
  userHasReviewed: boolean = false;
  rating: number = 10;

  constructor(titleService: Title) {
    const id = this.route.snapshot.params['id'];
    this.destinationService.getDestination(id).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.destination = r;
      titleService.setTitle(`${this.destination.destination} - Destination Picker`);
      this.loadMap();
    });

    const user = JSON.parse(sessionStorage.getItem('user') as string);
    if (!user) return;
    this.user = user;

    this.userService.getLists(user.id).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.lists = r;
    });
  }

  loadMap() {
    if (!this.destination) return;

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
            [this.destination.longitude, this.destination.latitude]), zoom: 10,
      }),
    });
  }

  addToList() {
    const listId = (document.getElementById('list') as HTMLSelectElement).value;
    if (!listId) {
      alert('Please select a list');
      return;
    }

    if (!this.destination) {
      alert('Destination not found');
      return;
    }

    const list = this.lists.find(l => l.id === listId)!;
    this.listService.addDestinationToList(list, this.destination).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }

      alert('Destination added to list');
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

    const review: DestinationReview = {
      destination_id: this.destination?.id || '',
      user: this.user!,
      rating: this.rating.toString(),
      comment: commentElement.value || '',
      is_hidden: false
    }

    this.destinationService.addReviewToDestination(review).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }

      if (!this.destination) return;
      this.destination.reviews.push(review);
      this.userHasReviewed = true;
    });
  }
}
