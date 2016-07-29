import { RouterConfig } from '@angular/router';
import { Home } from './home';
import { Login } from './login';
import { Jobs } from './jobs';
import { Settings } from './settings';
import { NoContent } from './no-content';
import { AuthGuard } from './auth/auth-guard.service';

export const routes: RouterConfig = [
  { path: '', component: Home, canActivate: [AuthGuard] },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'jobs', component: Jobs, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'settings', component: Settings, canActivate: [AuthGuard] },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContent },
];
