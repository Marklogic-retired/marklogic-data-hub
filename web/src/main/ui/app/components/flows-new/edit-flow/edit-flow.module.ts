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

import { MatchingComponent } from './mastering/matching/matching.component';
import { MatchOptionsUiComponent } from './mastering/matching/ui/match-options-ui.component';
import { MatchThresholdsUiComponent } from "./mastering/matching/ui/match-thresholds-ui.component";
import { AddMatchOptionDialogComponent } from './mastering/matching/ui/add-match-option-dialog.component';
import { AddMatchThresholdDialogComponent } from './mastering/matching/ui/add-match-threshold-dialog.component';
import { MergingComponent } from './mastering/merging/merging.component';
import { MergeOptionsUiComponent } from './mastering/merging/ui/merge-options-ui.component';
import { MergeStrategiesUiComponent } from './mastering/merging/ui/merge-strategies-ui.component';
import { MergeCollectionsUiComponent } from './mastering/merging/ui/merge-collections-ui.component';
import { AddMergeOptionDialogComponent } from './mastering/merging/ui/add-merge-option-dialog.component';
import { AddMergeStrategyDialogComponent } from './mastering/merging/ui/add-merge-strategy-dialog.component';
import { AddMergeCollectionDialogComponent } from './mastering/merging/ui/add-merge-collection-dialog.component';
import { MappingComponent } from './mapping/mapping.component';
import { MappingUiComponent } from './mapping/ui/mapping-ui.component';

import { BsDropdownModule, TooltipModule } from 'ngx-bootstrap';
import { FocusElementDirective } from '../../../directives/focus-element/focus-element.directive';
import { ListFilterPipe } from '../../../components/mappings/ui/listfilter.pipe';
import { TruncateCharactersPipe } from '../../../pipes/truncate';import { MdlModule } from '@angular-mdl/core';

import { CustomComponent } from './custom/custom.component';
import { CustomUiComponent } from './custom/ui/custom-ui.component';

@NgModule({
  declarations: [
    EditFlowComponent,
    EditFlowUiComponent,
    NewStepDialogComponent,
    RunFlowDialogComponent,
    StepComponent,
    StepperComponent,
    MatchingComponent,
    MatchOptionsUiComponent,
    MatchThresholdsUiComponent,
    AddMatchOptionDialogComponent,
    AddMatchThresholdDialogComponent,
    MergingComponent,
    MergeOptionsUiComponent,
    MergeStrategiesUiComponent,
    MergeCollectionsUiComponent,
    AddMergeOptionDialogComponent,
    AddMergeStrategyDialogComponent,
    AddMergeCollectionDialogComponent,
    MappingComponent,
    MappingUiComponent,
    FocusElementDirective,
    ListFilterPipe,
    TruncateCharactersPipe,
    CustomComponent,
    CustomUiComponent
  ],
  imports     : [
    CommonModule,
    MaterialModule,
    CdkStepperModule,
    DragDropModule,
    RouterModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BsDropdownModule.forRoot(),
    TooltipModule.forRoot(),
    MdlModule
  ],
  exports: [
    FocusElementDirective,
    ListFilterPipe,
    TruncateCharactersPipe
  ],
  providers   : [
  ],
  entryComponents: [
    NewStepDialogComponent,
    RunFlowDialogComponent,
    AddMatchOptionDialogComponent,
    AddMatchThresholdDialogComponent,
    AddMergeOptionDialogComponent,
    AddMergeStrategyDialogComponent,
    AddMergeCollectionDialogComponent
  ]
})
export class EditFlowModule {}
