import { Routes } from '@angular/router';
import { TracesComponent, TraceViewerComponent } from './traces';
import { NoContentComponent } from './no-content';

export const ROUTES: Routes = [
  { path: '', component: TracesComponent },
  { path: 'traces/:id', component: TraceViewerComponent },
  // make sure you match the component type string to the require in asyncRoutes
  { path: '**',    component: NoContentComponent },
];
