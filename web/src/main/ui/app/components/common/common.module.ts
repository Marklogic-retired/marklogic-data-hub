import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {RouterModule} from '@angular/router';
import {HttpErrorComponent} from './http-error/http-error.component';
import {ConfirmationDialogComponent} from "./confirm-dialog/confirm-dialog.component";
import {AlertDialogComponent} from "./alert-dialog/alert-dialog.component";
import {InfoLabelComponent} from "./info-label/info-label-component";
import {SpinnerComponent} from './spinner/spinner.component';
import {MaterialModule} from "../theme/material.module";
import {TooltipModule} from "ngx-bootstrap";


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TooltipModule.forRoot(),
    RouterModule
  ],
  exports: [
    ConfirmationDialogComponent,
    AlertDialogComponent,
    InfoLabelComponent,
    SpinnerComponent,
    HttpErrorComponent
  ],
  declarations: [
    ConfirmationDialogComponent,
    AlertDialogComponent,
    InfoLabelComponent,
    SpinnerComponent,
    HttpErrorComponent
  ],
  providers: [],
  entryComponents: [ConfirmationDialogComponent, AlertDialogComponent]
})
export class AppCommonModule {
}
