import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TruncateCharactersPipe } from './pipes/truncate';
import { ListFilterPipe } from './shared/components/mappings/listfilter.pipe';
import { AppComponent } from './app.component';
import { AppUiComponent } from './shared/components';
import { FlowsComponent } from './components/flows';
import { HasBugsDialogComponent } from './shared/components';
import {
  EntityModelerComponent
} from './components/entity-modeler';
import { LoginComponent } from './components/login';
import { LoginUIComponent } from './shared/components'
import { SettingsComponent } from './components/settings';
import { SettingsUiComponent } from './shared/components';

import { MdlModule } from '@angular-mdl/core';
import { MdlPopoverModule } from '@angular-mdl/popover';
import { MdlSelectModule } from '@angular-mdl/select';
import { GridManiaModule } from './shared/components/grid';
import { BsDropdownModule, TooltipModule } from 'ngx-bootstrap';

import { ROUTES } from './app.routes';
import { AUTH_PROVIDERS } from './services/auth';
import { CodemirrorComponent } from './shared/components/codemirror';
import { FolderBrowserComponent } from './components/folder-browser/folder-browser.component';
import { FolderBrowserUiComponent } from './shared/components';
import { HeaderComponent } from './components/header/header.component';
import { HeaderUiComponent } from './shared/components';
import { JobsComponent, JobOutputComponent } from './components/jobs';
import { JobsUiComponent, JobOutputUiComponent, JobExportUiComponent } from './shared/components/jobs';
import { MlcpComponent } from './components/mlcp';
import { MlcpUiComponent } from './shared/components/mlcp';
import { MlErrorComponent } from './shared/components/ml-error';
import { NewEntityComponent } from './shared/components/new-entity/new-entity.component';
import { NewFlowComponent } from './components/new-flow/new-flow.component';
import { NewFlowUiComponent } from './shared/components/new-flow/new-flow-ui.component';
import { NoContentComponent } from './components/no-content';
import { PaginationComponent } from './shared/components/pagination';
import { ResizableComponent } from './shared/components';
import { SelectComponent } from './shared/components';
import { SelectListComponent } from './shared/components';
import { TracesComponent, TraceViewerComponent } from './components/traces';
import { TracesUiComponent } from './shared/components/traces';
import { SearchComponent, SearchViewerComponent } from './components/search';
import { SearchUiComponent } from './shared/components/search';
import { SearchViewerUiComponent } from './shared/components/search';

import { DeployService } from './services/deploy/deploy.service';
import { EntitiesService } from './models/entities.service';
import { InstallService } from './services/installer';
import { JobService } from './components/jobs/jobs.service';
import { JobListenerService } from './components/jobs/job-listener.service';
import { MapService } from './components/mappings/map.service';
import { ProjectService } from './services/projects';
import { SettingsService } from './components/settings';
import { STOMPService } from './services/stomp';
import { ClipboardDirective } from './directives/clipboard/clipboard.directive';
import { FocusElementDirective } from './shared/directives/focus-element/focus-element.directive';
import { TraceService } from './components/traces/trace.service';
import { SearchService } from './components/search/search.service';
import { HarmonizeFlowOptionsComponent } from './components/harmonize-flow-options';
import { HarmonizeFlowOptionsUiComponent } from './shared/components';
import { DashboardComponent } from './components/dashboard';
import { DashboardUiComponent } from './shared/components';
import { TitlecasePipe } from './titlecase.pipe';
import { InlineEditComponent } from './shared/components';
import { FacetsComponent } from './shared/components/facets/facets.component';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { DatePipeModule } from './pipes/date-pipe/date-pipe.module';

import { SelectKeyValuesComponent } from './shared/components';
import { JobExportDialogComponent } from './components/jobs';

import { MapComponent } from './components/mappings';
import { MapUiComponent } from "./shared/components";
import { MappingsComponent } from "./components/mappings";
import { MappingsUiComponent } from "./shared/components";
import { NewMapComponent } from "./components/mappings/new-map.component";
import { NewMapUiComponent } from "./shared/components";
import { ThemeModule } from "./shared/components";
import { FlowsUiComponent } from './shared/components/flows';
import {
  ChooseCollationComponent,
  EntityBoxComponent,
  TraceViewerUiComponent,
  EntityEditorComponent,
  ExternalDefDialogComponent
} from './shared/components';

@NgModule({
  declarations: [
    AppComponent,
    AppUiComponent,
    CodemirrorComponent,
    FolderBrowserComponent,
    FolderBrowserUiComponent,
    HeaderComponent,
    HeaderUiComponent,
    HasBugsDialogComponent,
    FlowsComponent,
    FlowsUiComponent,
    ChooseCollationComponent,
    EntityBoxComponent,
    EntityEditorComponent,
    EntityModelerComponent,
    ExternalDefDialogComponent,
    JobsComponent,
    JobsUiComponent,
    JobExportUiComponent,
    JobExportDialogComponent,
    JobOutputComponent,
    JobOutputUiComponent,
    LoginComponent,
    MlcpComponent,
    MapComponent,
    MappingsComponent,
    MappingsUiComponent,
    LoginUIComponent,
    MlcpUiComponent,
    MlErrorComponent,
    NewEntityComponent,
    NewFlowComponent,
    NewFlowUiComponent,
    NewMapComponent,
    NewMapUiComponent,
    PaginationComponent,
    ResizableComponent,
    SelectComponent,
    SelectListComponent,
    SettingsComponent,
    SettingsUiComponent,
    TracesComponent,
    TracesUiComponent,
    TraceViewerComponent,
    TraceViewerUiComponent,
    SearchComponent,
    SearchUiComponent,
    SearchViewerComponent,
    SearchViewerUiComponent,
    NoContentComponent,
    ClipboardDirective,
    FocusElementDirective,
    HarmonizeFlowOptionsComponent,
    HarmonizeFlowOptionsUiComponent,
    DashboardComponent,
    DashboardUiComponent,
    InlineEditComponent,
    FacetsComponent,
    TitlecasePipe,
    TruncateCharactersPipe,
    ListFilterPipe,
    ObjectToArrayPipe,
    SelectKeyValuesComponent,
    MapComponent,
    MapUiComponent,
    MappingsComponent,
    SettingsUiComponent
  ],
  entryComponents: [
    HasBugsDialogComponent,
    ChooseCollationComponent,
    ExternalDefDialogComponent,
    EntityEditorComponent,
    NewEntityComponent,
    NewFlowComponent,
    NewMapComponent,
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
    GridManiaModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    DatePipeModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    ThemeModule
  ],
  providers: [
    AUTH_PROVIDERS,
    DeployService,
    EntitiesService,
    InstallService,
    JobService,
    JobListenerService,
    MapService,
    ProjectService,
    SettingsService,
    STOMPService,
    TraceService,
    SearchService,
    TooltipModule
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule { }
