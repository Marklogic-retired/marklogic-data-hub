import { RouterConfig } from '@angular/router';
import { Home } from './home';
import { Login } from './login';
import { Tasks } from './tasks';
import { NoContent } from './no-content';

export const routes: RouterConfig = [
  { path: '',      component: Home },
  { path: 'home',  component: Home },
  { path: 'tasks',  component: Tasks },
  { path: 'login',  component: Login },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContent },
];
