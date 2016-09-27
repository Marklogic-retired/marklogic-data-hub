import { Routes } from '@angular/router';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { JobsComponent } from './jobs';
import { TracesComponent, TraceViewerComponent } from './traces';
import { SettingsComponent } from './settings';
import { NoContentComponent } from './no-content';
import { AuthGuard } from './auth/auth-guard.service';

export const ROUTES: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'jobs', component: JobsComponent, canActivate: [AuthGuard] },
  { path: 'traces', component: TracesComponent, canActivate: [AuthGuard] },
  { path: 'traces/:id', component: TraceViewerComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContentComponent },
];
