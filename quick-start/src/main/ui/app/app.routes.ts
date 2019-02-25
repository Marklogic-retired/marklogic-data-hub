import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard';
import { FlowsComponent } from './components/flows';
import { EntityModelerComponent } from './components/entity-modeler/entity-modeler.component';
import { MapComponent } from './components/mappings';
import { MappingsComponent } from './components/mappings';
import { LoginComponent } from './components/login';
import { JobsComponent } from './components/jobs';
import { SettingsComponent } from './components/settings';
import { TracesComponent, TraceViewerComponent } from './components/traces';
import { SearchComponent, SearchViewerComponent } from './components/search';
import { NoContentComponent } from './components/no-content';
import { EditFlowComponent } from './components/manage-flows/edit-flow/edit-flow.component';
import { AuthGuard } from './services/auth/auth-guard.service';
import {FlowsPageComponent} from "./components/manage-flows/manage-flows/flows-page.component";

export const ROUTES: Routes = [
  { path: '', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'entities', component: EntityModelerComponent, canActivate: [AuthGuard] },
  {
    path: 'mappings',
    component: MappingsComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: ':entity/:map',
        component: MapComponent
      }
    ]
  },
  { path: 'mappings/map', component: MapComponent, canActivate: [AuthGuard] },
  { path: 'flows', component: FlowsComponent, canActivate: [AuthGuard] },
  { path: 'flows-page', component: FlowsPageComponent, canActivate: [AuthGuard]},
  { path: 'flows/:entityName/:flowName/:flowType', component: FlowsComponent, canActivate: [AuthGuard] },
  { path: 'edit-flow', component: EditFlowComponent, canActivate: [AuthGuard] },
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
