import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard';
import { EntitiesComponent } from './entities';
import { LoginComponent } from './login';
import { JobsComponent } from './jobs';
import { TracesComponent, TraceViewerComponent } from './traces';
import { SearchComponent, SearchViewerComponent } from './search';
import { SettingsComponent } from './settings';
import { NoContentComponent } from './no-content';
import { AuthGuard } from './auth/auth-guard.service';

export const ROUTES: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'entities', component: EntitiesComponent, canActivate: [AuthGuard] },
  { path: 'entities/:entityName/:flowName/:flowType', component: EntitiesComponent, canActivate: [AuthGuard] },
  { path: 'jobs', component: JobsComponent, canActivate: [AuthGuard] },
  { path: 'traces', component: TracesComponent, canActivate: [AuthGuard] },
  { path: 'traces/:id', component: TraceViewerComponent, canActivate: [AuthGuard] },
  { path: 'browse', component: SearchComponent, canActivate: [AuthGuard] },
  { path: 'view', component: SearchViewerComponent, canActivate: [AuthGuard] },
  { path: 'login', component: LoginComponent },
  { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard] },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContentComponent },
];
