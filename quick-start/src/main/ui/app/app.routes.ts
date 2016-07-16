import { RouterConfig } from '@angular/router';
import { Home } from './home';
import { Login } from './login';
import { Tasks } from './tasks';
import { Settings } from './settings';
import { NoContent } from './no-content';

export const routes: RouterConfig = [
  { path: '', component: Home },
  { path: 'home', component: Home },
  { path: 'tasks', component: Tasks },
  { path: 'login', component: Login },
  { path: 'settings', component: Settings },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContent },
];
