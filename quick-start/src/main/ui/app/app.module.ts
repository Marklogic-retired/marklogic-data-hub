import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TruncateCharactersPipe } from './truncate';
import { AppComponent } from './app.component';
import { FlowsComponent } from './flows';
import { HasBugsDialogComponent } from './has-bugs-dialog';
import {
  ChooseCollationComponent,
  EntityBoxComponent,
  EntityModelerComponent,
  EntityEditorComponent,
  ExternalDefDialogComponent
} from './entity-modeler';
import { LoginComponent } from './login';
import { SettingsComponent } from './settings';

import { MdlModule } from '@angular-mdl/core';
import { MdlPopoverModule } from '@angular-mdl/popover';
import { MdlSelectModule } from '@angular-mdl/select';
import { GridManiaModule } from './grid';
import { BsDropdownModule } from 'ngx-bootstrap';

import { ROUTES } from './app.routes';
import { AUTH_PROVIDERS } from './auth';
import { CodemirrorComponent } from './codemirror';
import { FolderBrowserComponent } from './folder-browser/folder-browser.component';
import { HeaderComponent } from './header/header.component';
import { JobsComponent, JobOutputComponent } from './jobs';
import { MlcpUiComponent } from './mlcp-ui';
import { MlErrorComponent } from './ml-error';
import { NewEntityComponent } from './new-entity/new-entity.component';
import { NewFlowComponent } from './new-flow/new-flow.component';
import { NoContentComponent } from './no-content';
import { PaginationComponent } from './pagination';
import { ResizableComponent } from './resizable/resizable.component';
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
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { FacetsComponent } from './facets/facets.component';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { DatePipeModule } from './date-pipe/date-pipe.module';

import { SelectKeyValuesComponent } from './select-key-values/select-key-values.component';
import {JobExportDialogComponent} from "./jobs/job-export.component";

import { MapComponent } from './map';

@NgModule({
  declarations: [
    AppComponent,
    CodemirrorComponent,
    FolderBrowserComponent,
    HeaderComponent,
    HasBugsDialogComponent,
    FlowsComponent,
    ChooseCollationComponent,
    EntityBoxComponent,
    EntityEditorComponent,
    EntityModelerComponent,
    ExternalDefDialogComponent,
    JobsComponent,
    JobExportDialogComponent,
    JobOutputComponent,
    LoginComponent,
    MlcpUiComponent,
    MlErrorComponent,
    NewEntityComponent,
    NewFlowComponent,
    PaginationComponent,
    ResizableComponent,
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
    InlineEditComponent,
    FacetsComponent,
    TitlecasePipe,
    TruncateCharactersPipe,
    ObjectToArrayPipe,
    SelectKeyValuesComponent,
    MapComponent
  ],
  entryComponents: [
    HasBugsDialogComponent,
    ChooseCollationComponent,
    ExternalDefDialogComponent,
    EntityEditorComponent,
    NewEntityComponent,
    NewFlowComponent,
    JobOutputComponent,
    JobExportDialogComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdlModule,
    MdlPopoverModule,
    MdlSelectModule,
    TooltipModule,
    GridManiaModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    DatePipeModule,
    BsDropdownModule.forRoot()
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
