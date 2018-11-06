import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TruncateCharactersPipe } from './truncate'

import { AppComponent } from './app.component';

import { MdlModule } from '@angular-mdl/core';
import { CodemirrorComponent } from './codemirror';

import { ROUTES } from './app.routes';
import { HeaderComponent } from './header/header.component';
import { MlErrorComponent } from './ml-error';
import { NoContentComponent } from './no-content';
import { PaginationComponent } from './pagination';
import { TooltipModule } from './tooltip';
import { TracesComponent, TraceViewerComponent } from './traces';

import { TraceService } from './traces/trace.service';
import { TitlecasePipe } from './titlecase.pipe';
import { FacetsComponent } from './facets/facets.component';
import { ObjectToArrayPipe } from './object-to-array.pipe';
import { DatePipeModule } from './date-pipe/date-pipe.module';
import {ThemeModule} from "./theme/theme.module";

@NgModule({
  declarations: [
    AppComponent,
    CodemirrorComponent,
    HeaderComponent,
    MlErrorComponent,
    PaginationComponent,
    TracesComponent,
    TraceViewerComponent,
    NoContentComponent,
    TitlecasePipe,
    FacetsComponent,
    TruncateCharactersPipe,
    ObjectToArrayPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdlModule,
    TooltipModule,
    RouterModule.forRoot(ROUTES, { useHash: true }),
    DatePipeModule,
    ThemeModule
  ],
  providers: [
    TraceService
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule { }
