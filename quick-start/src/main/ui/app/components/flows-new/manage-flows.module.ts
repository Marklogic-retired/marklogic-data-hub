import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ManageFlowsComponent} from "./manage-flows/manage-flows.component";
import {MaterialModule} from "../theme/material.module";
import {ManageFlowsUiComponent} from "./manage-flows/ui/manage-flows-ui.component";
import {ConfirmationDialogComponent} from "../common";
import {NewFlowDialogComponent} from "./manage-flows/ui/new-flow-dialog.component";
import {HttpClientModule} from "@angular/common/http";

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent,
    ManageFlowsUiComponent,
    ManageFlowsComponent
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
