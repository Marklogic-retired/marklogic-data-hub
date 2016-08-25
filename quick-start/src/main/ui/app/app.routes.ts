import { provideRouter, Routes } from '@angular/router';
import { Home } from './home/index';
import { Login } from './login/index';
import { Jobs } from './jobs/index';
import { Traces, TraceViewer } from './traces/index';
import { Settings } from './settings/index';
import { NoContent } from './no-content/index';
import { AuthGuard } from './auth/auth-guard.service';

export const routes: Routes = [
  { path: '', component: Home, canActivate: [AuthGuard] },
  { path: 'home', component: Home, canActivate: [AuthGuard] },
  { path: 'jobs', component: Jobs, canActivate: [AuthGuard] },
  { path: 'traces', component: Traces, canActivate: [AuthGuard] },
  { path: 'traces/:id', component: TraceViewer, canActivate: [AuthGuard] },
  { path: 'login', component: Login },
  { path: 'settings', component: Settings, canActivate: [AuthGuard] },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContent },
];

export const APP_ROUTE_PROVIDER = provideRouter(routes);
