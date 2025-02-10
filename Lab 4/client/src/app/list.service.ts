import {Injectable} from '@angular/core';
import {Service} from './service';
import {APIResponse} from './api-response';
import {List} from './list';
import {Destination} from './destination';
import {ListReview} from './list-review';

@Injectable({
  providedIn: 'root',
})
export class ListService extends Service {
  url: string = `${this.host}/lists`;

  constructor() {
    super();
  }

  async createList(list: List): Promise<List | APIResponse> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(list),
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('list' in data) return data.list;
    else return data;
  }

  async addDestinationToList(list: List, destination: Destination): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${list.id}/${destination.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      },
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    return data;
  }

  async addReviewToList(review: ListReview): Promise<ListReview | APIResponse> {
    const res = await fetch(`${this.url}/${review.list_id}/review`, {
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

  async getRandomLists(amount: number): Promise<List[] | APIResponse> {
    const res = await fetch(`${this.host}/random-lists/${amount}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('lists' in data) return data.lists;
    else return data;
  }

  async getLists(): Promise<List[] | APIResponse> {
    const res = await fetch(this.url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('lists' in data) return data.lists;
    else return data;
  }

  async getList(id: string): Promise<List | APIResponse> {
    const res = await fetch(`${this.url}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('list' in data) return data.list;
    else return data;
  }

  async updateList(list: List): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${list.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(list),
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    return data;
  }

  async updateListReview(review: ListReview): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${review.list_id}/review`, {
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

  async deleteList(list: List): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${list.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    return data;
  }

  async deleteDestinationFromList(list: List, destination: Destination): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${list.id}/${destination.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    return data;
  }
}
