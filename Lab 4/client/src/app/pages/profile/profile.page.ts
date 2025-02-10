import {Component, inject} from '@angular/core';
import {UserService} from '../../user.service';
import {ActivatedRoute} from '@angular/router';
import {User} from '../../user';
import {NgForOf, NgIf, NgOptimizedImage} from '@angular/common';
import {ListComponent} from '../../components/list/list.component';
import {List} from '../../list';
import {ListService} from '../../list.service';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    NgIf, NgForOf, ListComponent, NgOptimizedImage],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.css',
})
export class ProfilePage {
  private route: ActivatedRoute = inject(ActivatedRoute);
  userService: UserService = inject(UserService);
  listService: ListService = inject(ListService);
  id: string;
  user!: User;
  currentUser!: User;
  isCurrentUser!: boolean;
  section: string = 'personal-info';
  lists: List[] = [];
  addList: boolean = false;
  message: string = '';

  constructor(titleService: Title) {
    const id = this.route.snapshot.params['id'];
    const user = JSON.parse(sessionStorage.getItem('user') as string);
    this.currentUser = user;

    this.id = id;
    if (!this.id) this.id = user?.id; else if (this.id === user.id) {
      window.location.href = '/profile';
      return;
    }
    if (!this.id) {
      window.location.href = '/login';
      return;
    }

    this.userService.getUser(this.id).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.user = r;
      this.isCurrentUser = this.user.id === user.id;
      titleService.setTitle(`${user.nickname} - Destination Picker`);
      const is_disabled = document.getElementById('is_disabled') as HTMLInputElement;
      const is_admin = document.getElementById('is_admin') as HTMLInputElement;
      if (is_disabled) is_disabled.checked = this.user.status === 'disabled';
      if (is_admin) is_admin.checked = this.user.type === 'admin';
    });
    this.userService.getLists(this.id).then(r => {
      if ('message' in r) {
        console.error(r.message);
        return;
      }

      this.lists = r;
      this.lists.forEach(list => {
        list.user = this.user;
      })
    });
  }

  validateEmail() {
    const email = document.getElementById('email')! as HTMLInputElement;
    const isValidEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.value);
    if (!isValidEmail) {
      email.classList.add('is-invalid');
    } else {
      email.classList.remove('is-invalid');
    }
  }

  validateNickname() {
    const nickname = document.getElementById('nickname')! as HTMLInputElement;
    const isValidNickname = nickname.value.length > 0;
    if (!isValidNickname) {
      nickname.classList.add('is-invalid');
    } else {
      nickname.classList.remove('is-invalid');
    }
  }

  validatePassword() {
    const password = document.getElementById('password')! as HTMLInputElement;
    const isValidPassword = password.value.length > 0;
    if (!isValidPassword) {
      password.classList.add('is-invalid');
    } else {
      password.classList.remove('is-invalid');
    }
  }

  validateNewPassword() {
    const newPassword = document.getElementById('new-password')! as HTMLInputElement;
    const confirmPassword = document.getElementById('confirm-password')! as HTMLInputElement;

    const isValidNewPassword = newPassword.value.length > 0;
    if (!isValidNewPassword) {
      newPassword.classList.add('is-invalid');
    } else {
      newPassword.classList.remove('is-invalid');
    }

    const isValidConfirmPassword = confirmPassword.value === newPassword.value && confirmPassword.value.length > 0;
    if (!isValidConfirmPassword) {
      confirmPassword.classList.add('is-invalid');
    } else {
      confirmPassword.classList.remove('is-invalid');
    }
  }

  savePersonalInfo() {
    this.validateEmail()
    this.validateNickname()

    const email = (document.getElementById('email')! as HTMLInputElement).value;
    const nickname = (document.getElementById('nickname')! as HTMLInputElement).value;

    this.user.email = email;
    this.user.nickname = nickname;

    this.userService.update(this.user).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }
    });
  }

  saveAdminInfo() {
    const is_disabled = (document.getElementById('is_disabled')! as HTMLInputElement).checked;
    const is_admin = (document.getElementById('is_admin')! as HTMLInputElement).checked;

    this.user.status = is_disabled ? 'disabled' : 'active';
    this.user.type = is_admin ? 'admin' : 'standard';

    this.userService.update(this.user).then(r => {
      if ('message' in r) {
        alert(r.message);
        return;
      }
    });
  }

  changePassword() {
    this.validatePassword()
    this.validateNewPassword()

    const password = (document.getElementById('password')! as HTMLInputElement).value;
    const newPassword = (document.getElementById('new-password')! as HTMLInputElement).value;

    this.userService.changePassword(password, newPassword).then(async r => {
      if (r.ok) {
        alert('Password changed successfully. You will be logged out.');
        this.userService.logout();
        window.location.href = '/login';
        return;
      }

      const data = await r.json();
      alert(data.message);
    });
  }

  saveList() {
    const name = (document.getElementById('list-name')! as HTMLInputElement).value;
    const description = (document.getElementById('list-description')! as HTMLInputElement).value;
    const is_private = (document.getElementById('list-private')! as HTMLInputElement).checked;
    const list: List = {
      id: '',
      name: name,
      description: description,
      is_private: is_private,
      user: this.user,
      destinations: [],
      average_rating: '',
      reviews: [],
    };

    if (!list.name) {
      this.message = 'Please enter a name for the list.';
      return;
    }

    this.listService.createList(list).then(r => {
      if ('message' in r) {
        this.message = r.message;
        return;
      }

      this.lists = [r].concat(this.lists);
      this.addList = false;
      this.message = '';
    });
  }
}
