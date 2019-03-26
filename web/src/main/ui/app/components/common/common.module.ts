import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";

import {ConfirmationDialogComponent, InfoLabelComponent} from ".";
import {MaterialModule} from "../theme/material.module";
import {TooltipModule} from "ngx-bootstrap";


@NgModule({
  imports: [
    CommonModule,
    MaterialModule,
    TooltipModule.forRoot()
  ],
  exports: [
    ConfirmationDialogComponent,
    InfoLabelComponent
  ],
  declarations: [
    ConfirmationDialogComponent,
    InfoLabelComponent
  ],
  providers: [],
  entryComponents: [ConfirmationDialogComponent]
})
export class AppCommonModule {
}
