import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { TruncateCharactersPipe } from 'ng2-truncate/dist/truncate-characters.pipe'
import { TruncateWordsPipe } from 'ng2-truncate/dist/truncate-words.pipe'

import { ConfirmModule } from './confirm';

import { AppComponent } from './app.component';

import { MdlModule } from 'angular2-mdl';
import { CodemirrorComponent } from './codemirror';
import { MomentModule } from 'angular2-moment';
import { MdDialogModule } from './dialog';

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
    TruncateWordsPipe,
    ObjectToArrayPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    MdlModule,
    ConfirmModule,
    TooltipModule,
    MomentModule,
    MdDialogModule.forRoot(),
    RouterModule.forRoot(ROUTES, { useHash: true })
  ],
  providers: [
    TraceService
  ],
  bootstrap: [
    AppComponent
  ],
})
export class AppModule {}
