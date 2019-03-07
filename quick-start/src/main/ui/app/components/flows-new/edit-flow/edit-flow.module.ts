import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { MaterialModule } from '../../theme/material.module';
import { EditFlowComponent } from './edit-flow.component';
import { EditFlowUiComponent } from './ui/edit-flow-ui.component';
import { NewStepDialogComponent } from './ui/new-step-dialog.component';
import { RunFlowDialogComponent } from './ui/run-flow-dialog.component';
import { StepComponent } from './ui/step.component';
import { StepperComponent } from './ui/stepper.component';
import { CheckAllComponent } from '../../common';

@NgModule({
  declarations: [
    EditFlowComponent,
    EditFlowUiComponent,
    NewStepDialogComponent,
    RunFlowDialogComponent,
    StepComponent,
    StepperComponent,
    CheckAllComponent
  ],
  imports     : [
    CommonModule,
    MaterialModule,
    CdkStepperModule,
    DragDropModule,
    RouterModule,
    HttpClientModule,
    FormsModule
  ],
  providers   : [
  ],
  entryComponents: [
    NewStepDialogComponent,
    RunFlowDialogComponent
  ]
})
export class EditFlowModule {}
