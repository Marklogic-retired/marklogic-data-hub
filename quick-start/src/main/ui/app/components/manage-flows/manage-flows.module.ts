import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {FlowsPageComponent} from "./manage-flows/flows-page.component";
import {MaterialModule} from "../theme/material.module";
import {FlowsPageUiComponent} from "./manage-flows/ui/flows-page-ui.component";
import {ConfirmationDialogComponent} from "../common";
import {NewFlowDialogComponent} from "./manage-flows/ui/new-flow-dialog.component";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent,
    FlowsPageUiComponent,
    FlowsPageComponent
  ],
  imports     : [
    MaterialModule,
    RouterModule,
    HttpClientModule
  ],
  providers   : [
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent
  ]
})
export class ManageFlowsModule {}
