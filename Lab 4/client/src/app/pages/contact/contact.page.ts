import {Component} from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  templateUrl: './contact.page.html',
  styleUrl: './contact.page.css',
})
export class ContactPage {
  isValidEmail: boolean = false;
  isValidSubject: boolean = false;
  isValidMessage: boolean = false;

  validateEmail() {
    const email = document.getElementById('email')! as HTMLInputElement;
    this.isValidEmail = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
        email.value);
    if (!this.isValidEmail) {
      email.classList.add('is-invalid');
    } else {
      email.classList.remove('is-invalid');
    }
  }

  validateSubject() {
    const subject = document.getElementById('subject')! as HTMLInputElement;
    this.isValidSubject = subject.value.length > 0;
    if (!this.isValidSubject) {
      subject.classList.add('is-invalid');
    } else {
      subject.classList.remove('is-invalid');
    }
  }

  validateMessage() {
    const message = document.getElementById('message')! as HTMLInputElement;
    const char_counter = document.getElementById('char-counter')!;
    this.isValidMessage = message.value.length <= 2500;
    char_counter.innerHTML = `${message.value.length} / 2500`;
    if (!this.isValidMessage) {
      message.classList.add('is-invalid');
      char_counter.classList.add('is-invalid');
    } else {
      message.classList.remove('is-invalid');
      char_counter.classList.remove('is-invalid');
    }
  }

  submit() {
    this.validateEmail();
    this.validateSubject();
    this.validateMessage();

    if (this.isValidEmail && this.isValidSubject && this.isValidMessage) {
      // do I really want emails from the user?
      alert('Message sent!');

      const email = document.getElementById('email')! as HTMLInputElement;
      const subject = document.getElementById('subject')! as HTMLSelectElement;
      const message = document.getElementById('message')! as HTMLTextAreaElement;

      email.classList.remove('is-invalid');
      subject.classList.remove('is-invalid');
      message.classList.remove('is-invalid');

      email.value = '';
      subject.value = '';
      message.value = '';
    }
  }
}
