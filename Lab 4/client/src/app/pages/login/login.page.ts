import {Component, inject} from '@angular/core';
import {UserService} from '../../user.service';
import {NgIf} from '@angular/common';
import {User} from '../../user';
import {Title} from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgIf,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css'
})
export class LoginPage {
  titleService: Title = inject(Title);
  userService: UserService = inject(UserService);
  isLogin: boolean;
  isValidEmail: boolean;
  isValidNickname: boolean;
  isValidPassword: boolean;
  error: string;

  constructor() {
    if (sessionStorage.getItem('user')) {
      window.location.href = '/';
    }

    this.isLogin = true;
    this.isValidEmail = false;
    this.isValidNickname = false;
    this.isValidPassword = false;
    this.error = '';
  }

  execute() {
    if (this.isLogin) {
      this.login();
    } else {
      this.register();
    }
  }

  login() {
    this.validateEmail();
    this.validatePassword();

    if (!this.isValidEmail || !this.isValidPassword) return;

    const email = (document.getElementById('email')! as HTMLInputElement).value;
    const password = (document.getElementById('password')! as HTMLInputElement).value;
    this.userService.login(email, password).then(r => {
      if ('message' in r) {
        if (r.message === 'User is not active.') {
          this.error = 'This account has been deactivated. Please contact an administrator for help.';
        } else {
          this.error = r.message;
        }

        return;
      }
      if (r.status === 'pending') {
        this.verify(r);
        return;
      }

      if (sessionStorage.getItem('user')) {
        window.location.href = '/';
      }
    });
  }

  register() {
    this.validateEmail();
    this.validateNickname();
    this.validatePassword();

    if (!this.isValidEmail || !this.isValidNickname || !this.isValidPassword) return;

    const email = (document.getElementById('email')! as HTMLInputElement).value;
    const nickname = (document.getElementById('nickname')! as HTMLInputElement).value;
    const password = (document.getElementById('password')! as HTMLInputElement).value;
    this.userService.register(email, nickname, password).then(r => {
      if ('message' in r) {
        this.error = r.message;
        return;
      }

      this.verify(r);
    });
  }

  verify(user: User) {
    if (confirm('Would you liked to verify your email?')) {
      window.open(`/verify/${user.id}`);
    }
  }

  switchType() {
    const title = document.getElementById('title')!;
    const button = document.getElementById('button')!;
    const switch_text = document.getElementById('switch-text')!;
    const email = document.getElementById('email')! as HTMLInputElement;
    const nickname = document.getElementById('nickname')! as HTMLInputElement;
    const password = document.getElementById('password')! as HTMLInputElement;

    email.value = '';
    if (nickname) nickname.value = '';
    password.value = '';

    email.classList.remove('is-invalid');
    if (nickname) nickname.classList.remove('is-invalid');
    password.classList.remove('is-invalid');

    if (this.isLogin) {
      this.titleService.setTitle('Register - Destination Picker');
      title.textContent = 'Register';
      button.textContent = 'Register';
      switch_text.textContent = 'Already have an account?';
      this.isLogin = false;
    } else {
      this.titleService.setTitle('Login - Destination Picker');
      title.textContent = 'Login';
      button.textContent = 'Login';
      switch_text.textContent = 'Don\'t have an account?';
      this.isLogin = true;
    }
  }

  validateEmail() {
    const email = document.getElementById('email')! as HTMLInputElement;
    this.isValidEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email.value);
    if (!this.isValidEmail) {
      email.classList.add('is-invalid');
    } else {
      email.classList.remove('is-invalid');
    }
  }

  validateNickname() {
    const nickname = document.getElementById('nickname')! as HTMLInputElement;
    this.isValidNickname = nickname.value.length > 0;
    if (!this.isValidNickname) {
      nickname.classList.add('is-invalid');
    } else {
      nickname.classList.remove('is-invalid');
    }
  }

  validatePassword() {
    const password = document.getElementById('password')! as HTMLInputElement;
    this.isValidPassword = password.value.length > 0;
    if (!this.isValidPassword) {
      password.classList.add('is-invalid');
    } else {
      password.classList.remove('is-invalid');
    }
  }
}
