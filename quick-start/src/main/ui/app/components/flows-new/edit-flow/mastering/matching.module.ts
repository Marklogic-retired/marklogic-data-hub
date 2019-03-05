import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from "../../../theme/material.module";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatchingComponent} from './matching.component';
import {MatchingUiComponent} from './ui/matching-ui.component';
import {MatchOptionsUiComponent} from './ui/match-options-ui.component';
import {MatchThresholdsUiComponent} from "./ui/match-thresholds-ui.component";

import {AddMatchOptionDialogComponent} from './ui/add-match-option-dialog.component';
import {AddMatchThresholdDialogComponent} from './ui/add-match-threshold-dialog.component';

@NgModule({
  declarations: [
    MatchingComponent,
    MatchingUiComponent,
    MatchOptionsUiComponent,
    MatchThresholdsUiComponent,
    AddMatchOptionDialogComponent,
    AddMatchThresholdDialogComponent
  ],
  imports     : [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers   : [
  ],
  entryComponents: [
    AddMatchOptionDialogComponent,
    AddMatchThresholdDialogComponent
  ]
})
export class MatchingModule {}
