import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  username = '';
  password = '';
  error = '';

  constructor(private router: Router) {}

  handleSubmit(event: Event) {
    event.preventDefault();
    this.error = '';

    const form = event.target as HTMLFormElement;
    const username = (form.querySelector('#username') as HTMLInputElement).value;
    const password = (form.querySelector('#password') as HTMLInputElement).value;

    if (!username || !password) {
      this.error = 'Bitte füllen Sie alle Felder aus!';
      return;
    }

    const valid =
      (username === 'admin' && password === 'p') ||
      (username === 'user' && password === 'p');

    if (valid) {
      this.router.navigate(['/search']);
    } else {
      this.error = 'Anmeldung fehlgeschlagen';
    }
  }
}