import { Routes } from '@angular/router';
import { Search } from './search/search';
import { Login } from './components/login/login'

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'search', component: Search },
  { path: '', redirectTo: 'login', pathMatch: 'full',},
];