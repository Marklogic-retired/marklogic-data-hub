import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";

import {ConfirmationDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {InfoLabelComponent} from "./info-label/info-label-component";
import {SpinnerComponent} from './spinner/spinner.component';
import {HttpErrorComponent} from './http-error/http-error.component';
import {MaterialModule} from "../theme/material.module";
import {TooltipModule} from "ngx-bootstrap";
import {RouterModule} from "@angular/router";


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TooltipModule.forRoot(),
    RouterModule
  ],
  exports: [
    ConfirmationDialogComponent,
    InfoLabelComponent,
    SpinnerComponent,
    HttpErrorComponent
  ],
  declarations: [
    ConfirmationDialogComponent,
    InfoLabelComponent,
    SpinnerComponent,
    HttpErrorComponent
  ],
  providers: [],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppCommonModule {
}
