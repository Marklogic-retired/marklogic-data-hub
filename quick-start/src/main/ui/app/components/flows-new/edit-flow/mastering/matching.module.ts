import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {MaterialModule} from "../../../theme/material.module";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {MatchingComponent} from './matching.component';
import {MatchingUiComponent} from './ui/matching-ui.component';
import {MatchOptionsUiComponent} from './ui/match-options-ui.component';

import {AddMatchOptionDialogComponent} from './ui/add-match-option-dialog.component';

@NgModule({
  declarations: [
    MatchingComponent,
    MatchingUiComponent,
    MatchOptionsUiComponent,
    AddMatchOptionDialogComponent
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
    AddMatchOptionDialogComponent
  ]
})
export class MatchingModule {}
