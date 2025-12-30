import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './book-create.html',
  styleUrl: './book-create.css',
})
export class Create {
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:3000';
  private readonly restPath = '/rest';

  loading = signal(false);
  error = signal<string | null>(null);

  book = {
    titel: '',
    untertitel: '',
    autor: '',
    isbn: '',
    preis: 0,
    rabatt: 0,
    buchart: '' as '' | 'EPUB' | 'HARDCOVER' | 'PAPERBACK',
    rating: 0,
    homepage: '',
    javascript: false,
    typescript: false,
    erscheinungsdatum: '',
    lieferbar: false,
  };

  async save() {
    this.loading.set(true);
    this.error.set(null);

    if (!this.book.titel.trim()) {
      this.error.set('Der Titel darf nicht leer sein.');
      this.loading.set(false);
      return;
    }

    if (!this.book.buchart) {
      this.error.set('Die Buchart muss ausgewählt werden.');
      this.loading.set(false);
      return;
    }

    if (!/^(978|979)-\d{1,5}-\d{1,7}-\d{1,6}-\d$/.test(this.book.isbn)) {
      this.error.set('Ungültige ISBN (z.B. 978-3-86490-357-1).');
      this.loading.set(false);
      return;
    }

    if (this.book.preis < 0) {
      this.error.set('Der Preis darf nicht negativ sein.');
      this.loading.set(false);
      return;
    }

    if (this.book.rating < 0 || this.book.rating > 5) {
      this.error.set('Die Bewertung muss zwischen 0 und 5 liegen.');
      this.loading.set(false);
      return;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(this.book.erscheinungsdatum)) {
      this.error.set('Das Datum muss im Format YYYY-MM-DD sein.');
      this.loading.set(false);
      return;
    }

    const payload = {
      isbn: this.book.isbn,
      rating: this.book.rating,
      preis: this.book.preis,
      rabatt: this.book.rabatt,
      homepage: this.book.homepage,
      javascript: this.book.javascript,
      typescript: this.book.typescript,
      datum: this.book.erscheinungsdatum,
      lieferbar: this.book.lieferbar,
      art: this.book.buchart,
      titel: {
        titel: this.book.titel,
        untertitel: this.book.untertitel,
      },
      schlagwoerter: this.book.autor
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
    };

    try {
      const url = `${this.baseUrl}${this.restPath}`;
      await firstValueFrom(this.http.post(url, payload));
      void this.router.navigate(['/search']);
    } catch (err) {
      this.error.set('Fehler beim Speichern des Buches.');
      console.error(err);
    } finally {
      this.loading.set(false);
    }
  }

  cancel() {
    void this.router.navigate(['/search']);
  }
}
