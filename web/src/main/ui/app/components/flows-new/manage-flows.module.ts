import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {ManageFlowsComponent} from "./manage-flows/manage-flows.component";
import {MaterialModule} from "../theme/material.module";
import {ManageFlowsUiComponent} from "./manage-flows/ui/manage-flows-ui.component";
import {AppCommonModule} from "../common";
import {FlowSettingsDialogComponent} from "./manage-flows/ui/flow-settings-dialog.component";
import {StepIconsUiComponent} from "./manage-flows/ui/step-icons-ui.component";
import {HttpClientModule} from "@angular/common/http";
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";

@NgModule({
  declarations: [
    FlowSettingsDialogComponent,
    ManageFlowsUiComponent,
    ManageFlowsComponent,
    StepIconsUiComponent
  ],
  imports     : [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule
  ],
  providers   : [
  ],
  entryComponents: [
    FlowSettingsDialogComponent
  ],
  exports: [
    ManageFlowsUiComponent
  ]
})
export class ManageFlowsModule {}
