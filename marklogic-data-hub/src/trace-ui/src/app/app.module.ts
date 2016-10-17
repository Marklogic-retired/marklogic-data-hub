import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';

import { ConfirmModule } from './confirm';

import { AppComponent } from './app.component';

import { MdlModule } from 'angular2-mdl';
import { CodemirrorModule } from 'ng2-codemirror';
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

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    MlErrorComponent,
    PaginationComponent,
    TracesComponent,
    TraceViewerComponent,
    NoContentComponent,
    TitlecasePipe
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
