import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {CdkStepperModule} from '@angular/cdk/stepper';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MaterialModule} from '../../theme/material.module';
import {EditFlowComponent} from './edit-flow.component';
import {EditFlowUiComponent} from './ui/edit-flow-ui.component';
import {NewStepDialogComponent} from './ui/new-step-dialog.component';
import {NewStepDialogUiComponent} from './ui/new-step-dialog-ui.component';
import {RunFlowDialogComponent} from './ui/run-flow-dialog.component';
import {StepComponent} from './ui/step.component';
import {StepperComponent} from './ui/stepper.component';

import {MatchingComponent} from './mastering/matching/matching.component';
import {MatchOptionsUiComponent} from './mastering/matching/ui/match-options-ui.component';
import {MatchThresholdsUiComponent} from "./mastering/matching/ui/match-thresholds-ui.component";
import {AddMatchOptionDialogComponent} from './mastering/matching/ui/add-match-option-dialog.component';
import {AddMatchThresholdDialogComponent} from './mastering/matching/ui/add-match-threshold-dialog.component';
import {MergingComponent} from './mastering/merging/merging.component';
import {MergeOptionsUiComponent} from './mastering/merging/ui/merge-options-ui.component';
import {MergeStrategiesUiComponent} from './mastering/merging/ui/merge-strategies-ui.component';
import {MergeCollectionsUiComponent} from './mastering/merging/ui/merge-collections-ui.component';
import {AddMergeOptionDialogComponent} from './mastering/merging/ui/add-merge-option-dialog.component';
import {AddMergeStrategyDialogComponent} from './mastering/merging/ui/add-merge-strategy-dialog.component';
import {AddMergeCollectionDialogComponent} from './mastering/merging/ui/add-merge-collection-dialog.component';
import {MappingComponent} from './mapping/mapping.component';
import {MappingUiComponent} from './mapping/ui/mapping-ui.component';
import {EntityTableUiComponent} from './mapping/ui/entity-table-ui.component';

import {BsDropdownModule, TooltipModule} from 'ngx-bootstrap';
import {FocusElementDirective} from '../../../directives/focus-element/focus-element.directive';
import {ListFilterPipe} from '../../../components/mappings/ui/listfilter.pipe';
import {MdlModule} from '@angular-mdl/core';
import {TruncateCharactersPipe} from '../../../pipes/truncate';
import {IngestComponent} from "./ingest/ingest.component";
import {IngestUiComponent} from "./ingest/ui/ingest-ui.component";
import {FolderBrowserModule} from "../../folder-browser/folder-browser.module";

import {CustomComponent} from './custom/custom.component';
import {CustomUiComponent} from './custom/ui/custom-ui.component';
import {AppCommonModule} from "../../common";

import {ClipboardDirective} from '../../../directives/clipboard/clipboard.directive';

@NgModule({
  declarations: [
    EditFlowComponent,
    EditFlowUiComponent,
    NewStepDialogComponent,
    NewStepDialogUiComponent,
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
    EntityTableUiComponent,
    IngestComponent,
    IngestUiComponent,
    FocusElementDirective,
    ListFilterPipe,
    TruncateCharactersPipe,
    CustomComponent,
    CustomUiComponent,
    ClipboardDirective
  ],
  imports: [
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
    MdlModule,
    FolderBrowserModule,
    AppCommonModule
  ],
  exports: [
    FocusElementDirective,
    ListFilterPipe,
    TruncateCharactersPipe,
    ClipboardDirective
  ],
  providers: [],
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
export class EditFlowModule {
}
