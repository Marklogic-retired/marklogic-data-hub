import { NgModule, ApplicationRef } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MdlModule } from 'angular2-mdl';
import { App, routes } from './index';
import { MaterialModule } from './material/index';
import { AUTH_PROVIDERS } from './auth/index';
import { Header } from './header/header.component';
import { Home } from './home/index';
import { Jobs } from './jobs/index';
import { Login } from './login/index';
import { NoContent } from './no-content/index';
import { Traces, TraceViewer } from './traces/index';

import { ConfirmService } from './confirm/index';
import { DeployService } from './deploy/deploy.service';
import { EntitiesService } from './entities/entities.service';
import { EnvironmentService } from './environment/index';
import { InstallService } from './installer/index';
import { JobListenerService } from './jobs/job-listener.service';
import { ProjectService } from './projects/projects.service';
import { SettingsService } from './settings/settings.service';
import { STOMPService } from './stomp/stomp.service';

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
    AUTH_PROVIDERS,
    ConfirmService,
    DeployService,
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
