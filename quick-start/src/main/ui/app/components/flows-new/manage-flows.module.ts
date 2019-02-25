import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ManageFlowsComponent} from "./manage-flows/manage-flows.component";
import {MaterialModule} from "../theme/material.module";
import {ManageFlowsUiComponent} from "./manage-flows/ui/manage-flows-ui.component";
import {ConfirmationDialogComponent} from "../common";
import {NewFlowDialogComponent} from "./manage-flows/ui/new-flow-dialog.component";
import {StepIconsUiComponent} from "./manage-flows/ui/step-icons-ui.component";
import {HttpClientModule} from "@angular/common/http";
import {CommonModule} from '@angular/common';

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent,
    ManageFlowsUiComponent,
    ManageFlowsComponent,
    StepIconsUiComponent
  ],
  imports     : [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    CommonModule
  ],
  providers   : [
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent
  ]
})
export class ManageFlowsModule {}
