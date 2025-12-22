import { Component, signal, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

type SearchMode = 'all' | 'title' | 'author';

interface Book {
  id: string;
  titel: string;
  autor?: string;
  isbn: string;
}

interface SearchQuery {
  q: string;
  isbn: string;
  sort: 'relevance' | 'titleAsc' | 'titleDesc' | 'yearDesc' | 'yearAsc';
  mode: SearchMode;
  onlyAvailable: boolean;
  includeEbooks: boolean;
  language: '' | 'de' | 'en';
  yearFrom: number | null;
  yearTo: number | null;
}

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './search.html',
})
export class Search {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = 'https://localhost:3000';
  private readonly restPath = '/rest';

  // UI state
  showFilters = signal(false);
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

  // query model
  query: SearchQuery = {
    q: '',
    isbn: '',
    sort: 'relevance',
    mode: 'all',
    onlyAvailable: false,
    includeEbooks: false,
    language: '',
    yearFrom: null,
    yearTo: null,
  };

  async onSearch(): Promise<void> {
    this.error.set(null);
    this.loading.set(true);

    try {
      const params = this.buildParams();
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
    this.query = {
      q: '',
      isbn: '',
      sort: 'relevance',
      mode: 'all',
      onlyAvailable: false,
      includeEbooks: false,
      language: '',
      yearFrom: null,
      yearTo: null,
    };
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
    console.log('Open details', bookId);
  }

  trackById(_index: number, book: Book): string {
    return book.id;
  }

  private buildParams(): HttpParams {
    let params = new HttpParams();
    const q = this.query.q.trim();
    const isbn = this.query.isbn.trim();
    const page = Math.max(0, this.page() - 1);
    const size = this.pageSize();

    if (isbn) {
      params = params.set('isbn', isbn);
    }
    if (q) {
      params = params.set('titel', q);
    }
    if (this.query.onlyAvailable) {
      params = params.set('lieferbar', 'true');
    }

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
