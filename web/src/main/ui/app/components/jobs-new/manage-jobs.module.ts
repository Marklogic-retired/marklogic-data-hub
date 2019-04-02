import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ManageJobsComponent } from "./manage-jobs.component";
import { MaterialModule } from "../theme/material.module";
import { ManageJobsUiComponent } from "./ui/manage-jobs-ui.component";
import { AppCommonModule } from "../common";
import { HttpClientModule } from "@angular/common/http";
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
//import { TruncateCharactersPipe } from '../../pipes/truncate';
import { EditFlowModule } from '../flows-new/edit-flow/edit-flow.module';
@NgModule({
  declarations: [
    //OutputDialogComponent,
    //TruncateCharactersPipe,
    ManageJobsUiComponent,
    ManageJobsComponent
  ],
  imports     : [
    MaterialModule,
    RouterModule,
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppCommonModule,
    EditFlowModule
  ],
  providers   : [
  ],
  entryComponents: [
    //OutputDialogComponent
  ]
})
export class ManageJobsModule {}
