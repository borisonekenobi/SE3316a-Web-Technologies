import {Injectable} from '@angular/core';
import {Service} from './service';
import {User} from './user';
import {APIResponse} from './api-response';
import {List} from './list';

@Injectable({
  providedIn: 'root'
})
export class UserService extends Service {
  url = `${this.host}/users`;

  constructor() {
    super();
  }

  async login(email: string, password: string): Promise<User | APIResponse> {
    const res = await fetch(`${this.host}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: email, password: password}),
    });

    const data = await res.json();
    if ('user' in data) {
      sessionStorage.setItem('user', JSON.stringify(data.user));
    }
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('user' in data) return data.user;
    else return data;
  }

  async register(email: string, nickname: string, password: string): Promise<User | APIResponse> {
    const res = await fetch(`${this.url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({email: email, nickname: nickname, password: password}),
    });
    return await res.json();
  }

  async verify(id: string): Promise<User | APIResponse> {
    const res = await fetch(`${this.url}/${id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      },
    });
    return await res.json();
  }

  async getUser(id: string): Promise<User | APIResponse> {
    const res = await fetch(`${this.url}/${id}`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      }
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('user' in data) return data.user;
    else return data;
  }

  async getLists(id: string): Promise<List[] | APIResponse> {
    const res = await fetch(`${this.url}/${id}/lists`, {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
      }
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('lists' in data) return data.lists;
    else return data;
  }

  async changePassword(password: string, newPassword: string): Promise<Response> {
    const user = JSON.parse(sessionStorage.getItem('user') as string);
    return await fetch(`${this.url}/${user.id}/password`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({password: password, new_password: newPassword}),
    });
  }

  async update(user: User): Promise<APIResponse> {
    const res = await fetch(`${this.url}/${user.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user)
    });

    const data = await res.json();
    if ('token' in data) {
      this.updateToken(data.token);
    }

    if ('user' in data) return data.user;
    else return data;
  }
}
