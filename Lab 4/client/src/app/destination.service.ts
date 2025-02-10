import {Injectable} from '@angular/core';
import {Destination} from './destination';
import {Service} from './service';
import {APIResponse} from './api-response';
import {DestinationReview} from './destination-review';

@Injectable({
  providedIn: 'root',
})
export class DestinationService extends Service {
  url = `${this.host}/destinations`;

  constructor() {
    super();
  }

  async addReviewToDestination(review: DestinationReview): Promise<DestinationReview | APIResponse> {
    const res = await fetch(`${this.url}/${review.destination_id}/review`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(review),
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('review' in data) return data.review;
    else return data;
  }

  async getAllDestinations(): Promise<Destination[] | APIResponse> {
    const res = await fetch(this.url);

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('destinations' in data) return data.destinations;
    else return data;
  }

  async getDestination(id: string): Promise<Destination | APIResponse> {
    const res = await fetch(`${this.url}/${id}`);

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('destination' in data) return data.destination;
    else return data;
  }

  async searchDestinations(search: string, limit: number, offset: number, sort: string): Promise<Destination[]> {
    const res = await fetch(`${this.url}/search?search=${search}&limit=${limit}&offset=${offset}&sort=${sort}`);

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('destinations' in data) return data.destinations;
    else return data;
  }

  async updateAllDestinations(destinations_data: string): Promise<APIResponse> {
    const res = await fetch(this.url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
      body: JSON.stringify({data: destinations_data}),
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    return data;
  }

  async updateDestinationReview(review: DestinationReview): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${review.destination_id}/review`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(review),
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    return data;
  }
}
