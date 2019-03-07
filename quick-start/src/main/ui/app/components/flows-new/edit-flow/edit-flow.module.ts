import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MaterialModule } from '../../theme/material.module';
import { EditFlowComponent } from './edit-flow.component';
import { EditFlowUiComponent } from './ui/edit-flow-ui.component';
import { NewStepDialogComponent } from './ui/new-step-dialog.component';
import { RunFlowDialogComponent } from './ui/run-flow-dialog.component';
import { StepComponent } from './ui/step.component';
import { StepperComponent } from './ui/stepper.component';

import { MatchingComponent } from './mastering/matching.component';
import { MatchingUiComponent } from './mastering/ui/matching-ui.component';
import { MatchOptionsUiComponent } from './mastering/ui/match-options-ui.component';
import { MatchThresholdsUiComponent } from "./mastering/ui/match-thresholds-ui.component";
import { AddMatchOptionDialogComponent } from './mastering/ui/add-match-option-dialog.component';
import { AddMatchThresholdDialogComponent } from './mastering/ui/add-match-threshold-dialog.component';

@NgModule({
  declarations: [
    EditFlowComponent,
    EditFlowUiComponent,
    NewStepDialogComponent,
    RunFlowDialogComponent,
    StepComponent,
    StepperComponent,
    MatchingComponent,
    MatchingUiComponent,
    MatchOptionsUiComponent,
    MatchThresholdsUiComponent,
    AddMatchOptionDialogComponent,
    AddMatchThresholdDialogComponent
  ],
  imports     : [
    CommonModule,
    MaterialModule,
    CdkStepperModule,
    DragDropModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers   : [
  ],
  entryComponents: [
    NewStepDialogComponent,
    RunFlowDialogComponent,
    AddMatchOptionDialogComponent,
    AddMatchThresholdDialogComponent
  ]
})
export class EditFlowModule {}
