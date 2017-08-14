import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TruncateCharactersPipe } from './truncate';
import { AppComponent } from './app.component';
import { EntitiesComponent } from './entities';
import { HasBugsDialogComponent } from './has-bugs-dialog';
import { LoginComponent } from './login';
import { SettingsComponent } from './settings';

import { MdlModule } from '@angular-mdl/core';
import { MdlPopoverModule } from '@angular-mdl/popover';
import { MdlSelectModule } from '@angular-mdl/select';
import { MomentModule } from 'angular2-moment';
import { GridManiaModule } from './grid';

import { ROUTES } from './app.routes';
import { AUTH_PROVIDERS } from './auth';
import { CodemirrorComponent } from './codemirror';
import { FolderBrowserComponent } from './folder-browser/folder-browser.component';
import { HeaderComponent } from './header/header.component';
import { JobsComponent, JobOutputComponent } from './jobs';
import { MlcpUiComponent } from './mlcp-ui';
import { MlErrorComponent } from './ml-error';
import { NewEntityComponent } from './new-entity/new-entity';
import { NewFlowComponent } from './new-flow/new-flow.component';
import { NoContentComponent } from './no-content';
import { PaginationComponent } from './pagination';
import { SelectComponent } from './select/select.component';
import { SelectListComponent } from './select-list/select-list.component';
import { TooltipModule } from './tooltip';
import { TracesComponent, TraceViewerComponent } from './traces';
import { SearchComponent, SearchViewerComponent } from './search';

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
import { SearchService } from './search/search.service';
import { HarmonizeFlowOptionsComponent } from './harmonize-flow-options/harmonize-flow-options.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { TitlecasePipe } from './titlecase.pipe';
import { FacetsComponent } from './facets/facets.component';
import { ObjectToArrayPipe } from './object-to-array.pipe';

import { Ng2DeviceDetectorModule } from 'ng2-device-detector';

@NgModule({
  declarations: [
    AppComponent,
    CodemirrorComponent,
    FolderBrowserComponent,
    HeaderComponent,
    EntitiesComponent,
    HasBugsDialogComponent,
    JobsComponent,
    JobOutputComponent,
    LoginComponent,
    MlcpUiComponent,
    MlErrorComponent,
    NewEntityComponent,
    NewFlowComponent,
    PaginationComponent,
    SelectComponent,
    SelectListComponent,
    SettingsComponent,
    TracesComponent,
    TraceViewerComponent,
    SearchComponent,
    SearchViewerComponent,
    NoContentComponent,
    ClipboardDirective,
    HarmonizeFlowOptionsComponent,
    DashboardComponent,
    FacetsComponent,
    TitlecasePipe,
    TruncateCharactersPipe,
    ObjectToArrayPipe
  ],
  entryComponents: [
    HasBugsDialogComponent,
    NewEntityComponent,
    NewFlowComponent,
    JobOutputComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdlModule,
    MdlPopoverModule,
    MdlSelectModule,
    TooltipModule,
    MomentModule,
    GridManiaModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    Ng2DeviceDetectorModule.forRoot()
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
    TraceService,
    SearchService
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule { }
