import { Component, signal, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface Book {
  id: string;
  titel: string;
  autor?: string;
  isbn: string;
}

interface SearchFormValue {
  titel: string;
  isbn: string;
  art: '' | 'EPUB' | 'HARDCOVER' | 'PAPERBACK';
  rating: number | null;
  preis: number | null;
  rabatt: number | null;
  datum: string;
  homepage: string;
  javascript: boolean;
  typescript: boolean;
  lieferbar: boolean;
}

type SearchFormGroup = FormGroup<{
  titel: FormControl<string>;
  isbn: FormControl<string>;
  art: FormControl<SearchFormValue['art']>;
  rating: FormControl<number | null>;
  preis: FormControl<number | null>;
  rabatt: FormControl<number | null>;
  datum: FormControl<string>;
  homepage: FormControl<string>;
  javascript: FormControl<boolean>;
  typescript: FormControl<boolean>;
  lieferbar: FormControl<boolean>;
}>;

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './search.html',
})
export class Search {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = 'https://localhost:3000';
  private readonly restPath = '/rest';

  private readonly defaultFormValue: SearchFormValue = {
    titel: '',
    isbn: '',
    art: '',
    rating: null,
    preis: null,
    rabatt: null,
    datum: '',
    homepage: '',
    javascript: false,
    typescript: false,
    lieferbar: false,
  };

  // UI state
  loading = signal(false);
  error = signal<string | null>(null);

  // data state
  books = signal<Book[]>([]);
  total = signal<number | null>(null);

  // pagination
  page = signal(1);
  pageSize = signal(10);

  totalPages = computed(() => {
    const t = this.total();
    if (t === null) return 0;
    return Math.max(1, Math.ceil(t / this.pageSize()));
  });

  form: SearchFormGroup = new FormGroup({
    titel: new FormControl('', { nonNullable: true }),
    isbn: new FormControl('', { nonNullable: true }),
    art: new FormControl<SearchFormValue['art']>('', { nonNullable: true }),
    rating: new FormControl<number | null>(null),
    preis: new FormControl<number | null>(null),
    rabatt: new FormControl<number | null>(null),
    datum: new FormControl('', { nonNullable: true }),
    homepage: new FormControl('', { nonNullable: true }),
    javascript: new FormControl(false, { nonNullable: true }),
    typescript: new FormControl(false, { nonNullable: true }),
    lieferbar: new FormControl(false, { nonNullable: true }),
  });

  async onSearch(event?: Event): Promise<void> {
    event?.preventDefault();
    this.error.set(null);
    this.loading.set(true);

    try {
      const params = this.buildParams(this.form.getRawValue());
      const url = `${this.baseUrl}${this.restPath}`;
      const page = await firstValueFrom(this.http.get<BookPage>(url, { params }));
      const mapped = page.content.map(book => this.mapBook(book));
      this.books.set(mapped);
      this.total.set(page.totalElements);
    } catch (err) {
      if (err instanceof HttpErrorResponse && err.status === 404) {
        this.books.set([]);
        this.total.set(0);
      } else {
        this.error.set('Backend-Fehler bei der Suche.');
      }
    } finally {
      this.loading.set(false);
    }
  }

  onReset(): void {
    this.form.reset(this.defaultFormValue);
    this.page.set(1);
    this.books.set([]);
    this.total.set(null);
    this.error.set(null);
  }

  gotoPage(p: number): void {
    const tp = this.totalPages();
    if (!tp) return;

    const next = Math.min(Math.max(1, p), tp);
    this.page.set(next);
  }

  openDetails(bookId: string): void {
    void this.router.navigate(['/buch', bookId]);
  }

  private buildParams(query: SearchFormValue): HttpParams {
    let params = new HttpParams();
    const page = Math.max(0, this.page() - 1);
    const size = this.pageSize();

    const setTrimmed = (key: string, value: string) => {
      const trimmed = value.trim();
      if (trimmed) params = params.set(key, trimmed);
    };
    const setNumber = (key: string, value: number | null) => {
      if (value === null || Number.isNaN(value)) return;
      params = params.set(key, String(value));
    };

    setTrimmed('isbn', query.isbn);
    setTrimmed('titel', query.titel);
    setTrimmed('homepage', query.homepage);

    if (query.art) params = params.set('art', query.art);
    if (query.lieferbar) params = params.set('lieferbar', 'true');
    if (query.javascript) params = params.set('javascript', 'true');
    if (query.typescript) params = params.set('typescript', 'true');

    setNumber('rating', query.rating);
    setNumber('preis', query.preis);
    setNumber('rabatt', query.rabatt);
    if (query.datum) params = params.set('datum', query.datum);

    params = params.set('page', String(page)).set('size', String(size));
    return params;
  }

  private mapBook(book: BuchApi): Book {
    const titel = [book.titel?.titel, book.titel?.untertitel].filter(Boolean).join(': ');
    return {
      id: String(book.id),
      titel: titel || '',
      autor: book.schlagwoerter?.join(', '),
      isbn: book.isbn,
    };
  }
}

interface BuchApiTitel {
  titel: string;
  untertitel?: string | null;
}

interface BuchApi {
  id: number;
  isbn: string;
  titel: BuchApiTitel;
  schlagwoerter?: string[];
}

interface BookPage {
  content: BuchApi[];
  totalElements: number;
}
