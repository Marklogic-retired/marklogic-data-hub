import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TRUNCATE_PIPES } from 'ng2-truncate';
import { AppComponent } from './app.component';
import { FlowsComponent } from './flows';
import {
  ChooseCollationComponent,
  EntityBoxComponent,
  EntityModelerComponent,
  EntityEditorComponent,
  ExternalDefDialogComponent
} from './entity-modeler';
import { LoginComponent } from './login';
import { SettingsComponent } from './settings';

import { MdlModule } from 'angular2-mdl';
import { MdlSelectModule } from '@angular2-mdl-ext/select';
import { CodemirrorModule } from 'ng2-codemirror';
import { MomentModule } from 'angular2-moment';
import { GridManiaModule } from './grid';

import { ROUTES } from './app.routes';
import { AUTH_PROVIDERS } from './auth';
import { FolderBrowserComponent } from './folder-browser/folder-browser.component';
import { HeaderComponent } from './header/header.component';
import { JobsComponent } from './jobs';
import { MlcpUiComponent } from './mlcp-ui';
import { MlErrorComponent } from './ml-error';
import { NewFlowComponent } from './new-flow/new-flow';
import { NoContentComponent } from './no-content';
import { PaginationComponent } from './pagination';
import { ResizableComponent } from './resizable/resizable.component';
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
import { DashboardComponent } from './dashboard/dashboard.component';
import { TitlecasePipe } from './titlecase.pipe';
import { InlineEditComponent } from './inline-edit/inline-edit.component';
import { FacetsComponent } from './facets/facets.component';
import { ObjectToArrayPipe } from './object-to-array.pipe';

@NgModule({
  declarations: [
    AppComponent,
    FolderBrowserComponent,
    HeaderComponent,
    FlowsComponent,
    ChooseCollationComponent,
    EntityBoxComponent,
    EntityEditorComponent,
    EntityModelerComponent,
    ExternalDefDialogComponent,
    JobsComponent,
    LoginComponent,
    MlcpUiComponent,
    MlErrorComponent,
    NewFlowComponent,
    PaginationComponent,
    ResizableComponent,
    SelectComponent,
    SelectListComponent,
    SettingsComponent,
    TracesComponent,
    TraceViewerComponent,
    NoContentComponent,
    ClipboardDirective,
    HarmonizeFlowOptionsComponent,
    DashboardComponent,
    InlineEditComponent,
    FacetsComponent,
    TitlecasePipe,
    TRUNCATE_PIPES,
    ObjectToArrayPipe
  ],
  entryComponents: [
    ChooseCollationComponent,
    ExternalDefDialogComponent,
    EntityEditorComponent,
    NewFlowComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdlModule,
    MdlSelectModule,
    CodemirrorModule,
    TooltipModule,
    MomentModule,
    GridManiaModule,
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
