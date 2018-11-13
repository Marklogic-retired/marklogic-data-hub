import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TruncateCharactersPipe } from './truncate';
import { ListFilterPipe } from './listfilter';
import { AppComponent } from './app.component';
import { AppUiComponent } from './shared/components';
import { FlowsComponent } from './flows';
import { HasBugsDialogComponent } from './shared/components';
import {
  EntityModelerComponent,
  ExternalDefDialogComponent
} from './entity-modeler';
import { LoginComponent } from './login';
import { SettingsComponent } from './settings';
import { SettingsUiComponent } from './shared/components';

import { MdlModule } from '@angular-mdl/core';
import { MdlPopoverModule } from '@angular-mdl/popover';
import { MdlSelectModule } from '@angular-mdl/select';
import { GridManiaModule } from './shared/components/grid';
import { BsDropdownModule } from 'ngx-bootstrap';

import { ROUTES } from './app.routes';
import { AUTH_PROVIDERS } from './auth';
import { CodemirrorComponent } from './shared/components/codemirror';
import { FolderBrowserComponent } from './folder-browser/folder-browser.component';
import { FolderBrowserUiComponent } from './shared/components';
import { HeaderComponent } from './header/header.component';
import { HeaderUiComponent } from './shared/components';
import { JobsComponent, JobOutputComponent } from './jobs';
import { JobsUiComponent, JobOutputUiComponent, JobExportUiComponent } from './shared/components/jobs';
import { MlcpUiComponent } from './mlcp-ui';
import { MlErrorComponent } from './shared/components/ml-error';
import { NewEntityComponent } from './shared/components/new-entity/new-entity.component';
import { NewFlowComponent } from './new-flow/new-flow.component';
import { NewFlowUiComponent } from './shared/components/new-flow/new-flow-ui.component';
import { NoContentComponent } from './no-content';
import { PaginationComponent } from './shared/components/pagination';
import { ResizableComponent } from './shared/components';
import { SelectComponent } from './shared/components';
import { SelectListComponent } from './shared/components';
import { TooltipModule } from './tooltip';
import { TracesComponent, TraceViewerComponent } from './traces';
import { SearchComponent, SearchViewerComponent } from './search';
import { SearchViewerUiComponent } from './shared/components/search';

import { DeployService } from './deploy/deploy.service';
import { EntitiesService } from './entities/entities.service';
import { InstallService } from './installer';
import { JobService } from './jobs/jobs.service';
import { JobListenerService } from './jobs/job-listener.service';
import { MapService } from './mappings/map.service';
import { ProjectService } from './projects';
import { SettingsService } from './settings';
import { STOMPService } from './stomp';
import { ClipboardDirective } from './clipboard/clipboard.directive';
import { FocusElementDirective } from './shared/directives/focus-element/focus-element.directive';
import { TraceService } from './traces/trace.service';
import { SearchService } from './search/search.service';
import { HarmonizeFlowOptionsComponent } from './harmonize-flow-options';
import { HarmonizeFlowOptionsUiComponent } from './shared/components';
import { DashboardComponent } from './dashboard';
import { TitlecasePipe } from './titlecase.pipe';
import { InlineEditComponent } from './shared/components';
import { FacetsComponent } from './shared/components/facets/facets.component';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { DatePipeModule } from './date-pipe/date-pipe.module';

import { SelectKeyValuesComponent } from './shared/components';
import { JobExportDialogComponent } from './jobs';

import { MapComponent } from './mappings';
import { MappingsComponent } from './mappings';
import { NewMapComponent } from './mappings/new-map.component';
import { NewMapUiComponent } from './shared/components';
import { ThemeModule } from './shared/components';
import { FlowsUiComponent } from './shared/components/flows';
import {
  ChooseCollationComponent,
  EntityBoxComponent,
  EntityEditorComponent
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
    TraceViewerComponent,
    SearchComponent,
    SearchViewerComponent,
    SearchViewerUiComponent,
    NoContentComponent,
    ClipboardDirective,
    FocusElementDirective,
    HarmonizeFlowOptionsComponent,
    HarmonizeFlowOptionsUiComponent,
    DashboardComponent,
    InlineEditComponent,
    FacetsComponent,
    TitlecasePipe,
    TruncateCharactersPipe,
    ListFilterPipe,
    ObjectToArrayPipe,
    SelectKeyValuesComponent,
    MapComponent,
    MappingsComponent
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
    TooltipModule,
    GridManiaModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    DatePipeModule,
    BsDropdownModule.forRoot(),
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
    SearchService
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule { }
