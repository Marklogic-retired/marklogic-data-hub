import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {RouterModule} from '@angular/router';
import {TruncateCharactersPipe} from './pipes/truncate';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {ListFilterPipe} from './components/mappings/ui/listfilter.pipe';
import {AppComponent} from './app.component';
import {
  AppUiComponent,
  ChooseCollationComponent,
  DashboardUiComponent,
  EntityBoxComponent,
  EntityEditorComponent,
  ExternalDefDialogComponent,
  FolderBrowserUiComponent,
  HarmonizeFlowOptionsUiComponent,
  HasBugsDialogComponent,
  HeaderUiComponent,
  InlineEditComponent,
  LoginUIComponent,
  MappingsUiComponent,
  MapUiComponent,
  NewMapUiComponent,
  ResizableComponent,
  SelectComponent,
  SelectKeyValuesComponent,
  SelectListComponent,
  SettingsUiComponent,
  ThemeModule,
  TraceViewerUiComponent
} from './components/index';
import {FlowsComponent} from './components/flows';
import {EntityModelerComponent} from './components/entity-modeler';
import {LoginComponent} from './components/login';
import {SettingsComponent, SettingsService} from './components/settings';

import {MdlModule} from '@angular-mdl/core';
import {MdlPopoverModule} from '@angular-mdl/popover';
import {MdlSelectModule} from '@angular-mdl/select';
import {GridManiaModule} from './components/grid';
import {BsDropdownModule, TooltipModule} from 'ngx-bootstrap';

import {ROUTES} from './app.routes';
import {AUTH_PROVIDERS} from './services/auth';
import {CodemirrorComponent} from './components/codemirror';
import {FolderBrowserComponent} from './components/folder-browser/folder-browser.component';
import {HeaderComponent} from './components/header/header.component';
import {JobExportDialogComponent, JobOutputComponent, JobsComponent} from './components/jobs';
import {JobExportUiComponent, JobOutputUiComponent, JobsUiComponent} from './components/jobs/ui';
import {MlcpComponent} from './components/mlcp';
import {MlcpUiComponent} from './components/mlcp/ui';
import {MlErrorComponent} from './components/ml-error';
import {NewEntityComponent} from './components/new-entity/new-entity.component';
import {NewFlowComponent} from './components/new-flow/new-flow.component';
import {NewFlowUiComponent} from './components/new-flow/ui/new-flow-ui.component';
import {NoContentComponent} from './components/no-content';
import {PaginationComponent} from './components/pagination';
import {TracesComponent, TraceViewerComponent} from './components/traces';
import {TracesUiComponent} from './components/traces/ui';
import {SearchComponent, SearchViewerComponent} from './components/search';
import {SearchUiComponent, SearchViewerUiComponent} from './components/search/ui';

import {DeployService} from './services/deploy/deploy.service';
import {EntitiesService} from './models/entities.service';
import {InstallService} from './services/installer';
import {JobService} from './components/jobs/jobs.service';
import {JobListenerService} from './components/jobs/job-listener.service';
import {MapService} from './components/mappings/map.service';
import {ProjectService} from './services/projects';
import {STOMPService} from './services/stomp';
import {ClipboardDirective} from './directives/clipboard/clipboard.directive';
import {FocusElementDirective} from './directives/focus-element/focus-element.directive';
import {TraceService} from './components/traces/trace.service';
import {SearchService} from './components/search/search.service';
import {HarmonizeFlowOptionsComponent} from './components/harmonize-flow-options';
import {DashboardComponent} from './components/dashboard';
import {TitlecasePipe} from './titlecase.pipe';
import {FacetsComponent} from './components/facets/facets.component';
import {ObjectToArrayPipe} from './object-to-array.pipe';
import {DatePipeModule} from './pipes/date-pipe/date-pipe.module';

import {MapComponent, MappingsComponent} from './components/mappings';
import {NewMapComponent} from "./components/mappings/new-map.component";
import {FlowsUiComponent} from './components/flows/ui';

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
    BrowserAnimationsModule,
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
