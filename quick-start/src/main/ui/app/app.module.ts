import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ConfirmModule } from './confirm';

import { AppComponent } from './app.component';
import { HomeComponent } from './home';
import { LoginComponent } from './login';
import { SettingsComponent } from './settings';

import { MdlModule } from 'angular2-mdl';
import { CodemirrorModule } from 'ng2-codemirror';
import { MomentModule } from 'angular2-moment';
import { MdDialogModule } from './dialog';
import { GridManiaModule } from './grid';

import { ROUTES } from './app.routes';
import { AUTH_PROVIDERS } from './auth';
import { FolderBrowserComponent } from './folder-browser/folder-browser.component';
import { HeaderComponent } from './header/header.component';
import { JobsComponent } from './jobs';
import { MlcpUiComponent } from './mlcp-ui';
import { NewEntityComponent } from './new-entity/new-entity';
import { NewFlowComponent } from './new-flow/new-flow';
import { NoContentComponent } from './no-content';
import { PaginationComponent } from './pagination';
import { SelectComponent } from './select/select.component';
import { SelectListComponent } from './select-list/select-list.component';
import { TooltipModule } from './tooltip';
import { TracesComponent, TraceViewerComponent } from './traces';

import { DeployService } from './deploy/deploy.service';
import { EntitiesService } from './entities/entities.service';
import { InstallService } from './installer';
import { JobService } from './jobs/jobs.service';
import { JobListenerService } from './jobs/job-listener.service';
import { ProjectService } from './projects/projects.service';
import { SettingsService } from './settings/settings.service';
import { STOMPService } from './stomp/stomp.service';
import { ClipboardDirective } from './clipboard/clipboard.directive';
import { TraceService } from './traces/trace.service';
import { HarmonizeFlowOptionsComponent } from './harmonize-flow-options/harmonize-flow-options.component';

@NgModule({
  declarations: [
    AppComponent,
    FolderBrowserComponent,
    HeaderComponent,
    HomeComponent,
    JobsComponent,
    LoginComponent,
    MlcpUiComponent,
    NewEntityComponent,
    NewFlowComponent,
    PaginationComponent,
    SelectComponent,
    SelectListComponent,
    SettingsComponent,
    TracesComponent,
    TraceViewerComponent,
    NoContentComponent,
    ClipboardDirective,
    HarmonizeFlowOptionsComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdlModule,
    ConfirmModule,
    CodemirrorModule,
    TooltipModule,
    MomentModule,
    GridManiaModule,
    MdDialogModule.forRoot(),
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [
    AUTH_PROVIDERS,
    DeployService,
    EntitiesService,
    InstallService,
    JobService,
    JobListenerService,
    ProjectService,
    SettingsService,
    STOMPService,
    TraceService
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}
