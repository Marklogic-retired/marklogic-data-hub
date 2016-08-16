import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from './platform/browser/angular2-material2';
import { MdlModule } from 'angular2-mdl';
import { App, routes, AppState } from './app';
import { AUTH_PROVIDERS } from './app/auth';
import { Header } from './app/header/header.component';
import { Home } from './app/home';
import { Jobs } from './app/jobs';
import { Login } from './app/login';
import { NoContent } from './app/no-content';
import { Traces, TraceViewer } from './app/traces';

import { ConfirmService } from './app/confirm';
import { EntitiesService } from './app/entities/entities.service';
import { EnvironmentService } from './app/environment';
import { InstallService } from './app/installer';
import { JobListenerService } from './app/jobs/job-listener.service';
import { ProjectService } from './app/projects/projects.service';
import { SettingsService } from './app/settings/settings.service';
import { STOMPService } from './app/stomp/stomp.service';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MaterialModule,
    MdlModule,
    RouterModule.forRoot(routes)
  ],
  providers: [
    AppState,
    AUTH_PROVIDERS,
    ConfirmService,
    EntitiesService,
    InstallService,
    JobListenerService,
    ProjectService,
    SettingsService,
    STOMPService
  ],
  declarations: [
    App,
    Header,
    Home,
    Jobs,
    Login,
    Traces,
    TraceViewer,
    NoContent
  ],
  bootstrap: [
    App
  ],
})
export class AppModule {}
//   constructor(private _appRef: ApplicationRef) { }

//   ngDoBootstrap() {
//     this._appRef.bootstrap(App);
//   }
// }
