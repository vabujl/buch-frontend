import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './book-create.html',
  styleUrl: './book-create.css',
})
export class Create {
  private readonly router = inject(Router);

  book = {
    titel: '',
    untertitel: '',
    autor: '',
    isbn: '',
    preis: 0,
    rabatt: 0,
    buchart: '',
    rating: 0,
    homepage: '',
    javascript: false,
    typescript: false,
    erscheinungsdatum: '',
    lieferbar: false,
  };

  save() {
    console.log('Buch gespeichert:', this.book);
    void this.router.navigate(['/search']);
  }

  cancel() {
    void this.router.navigate(['/search']);
  }
}
