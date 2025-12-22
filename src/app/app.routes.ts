import { Routes } from '@angular/router';
import { Search } from './search/search';
import { Login } from './components/login/login';
import { Create } from './components/book-create/book-create';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'search', component: Search },
  { path: 'create', component: Create },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
