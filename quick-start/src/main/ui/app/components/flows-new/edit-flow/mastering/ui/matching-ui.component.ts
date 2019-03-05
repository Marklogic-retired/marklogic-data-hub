import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MatchOption } from "../../../models/match-options.model";
import { MatchThreshold } from "../../../models/match-thresholds.model";
import { MatchOptionsUiComponent } from "./match-options-ui.component";
import { MatchThresholdsUiComponent } from "./match-thresholds-ui.component";
import { AddMatchOptionDialogComponent } from './add-match-option-dialog.component';
import { AddMatchThresholdDialogComponent } from './add-match-threshold-dialog.component';
import { ConfirmationDialogComponent } from "../../../../common";

@Component({
  selector: 'app-matching-ui',
  templateUrl: './matching-ui.component.html',
  styleUrls: ['./matching-ui.component.scss'],
})
export class MatchingUiComponent {

  @ViewChild(MatchOptionsUiComponent) matchOptionsUi: MatchOptionsUiComponent;
  @ViewChild(MatchThresholdsUiComponent) matchThresholdsUi: MatchThresholdsUiComponent;

  @Input() step: any;
  @Input() matchOptions: any;
  @Input() matchThresholds: any;

  @Output() createOption = new EventEmitter();
  @Output() saveOption = new EventEmitter();
  @Output() deleteOption = new EventEmitter();

  @Output() createThreshold = new EventEmitter();
  @Output() saveThreshold = new EventEmitter();
  @Output() deleteThreshold = new EventEmitter();

  constructor() {}

  onCreateOption(event): void {
    console.log('onCreateOption', event);
    this.createOption.emit(event);
  }

  onSaveOption(event): void {
    console.log('onSaveOption', event);
    this.saveOption.emit(event);
  }

  onDeleteOption(index): void {
    console.log('onDeleteOption');
    this.deleteOption.emit(index);
  }

  onCreateThreshold(event): void {
    console.log('onCreateThreshold', event);
    this.createThreshold.emit(event);
  }

  onSaveThreshold(event): void {
    console.log('onSaveThreshold', event);
    this.saveThreshold.emit(event);
  }

  onDeleteThreshold(index): void {
    console.log('onDeleteThreshold');
    this.deleteThreshold.emit(index);
  }

  renderRows(): void {
    this.matchOptionsUi.renderRows();
  }

  renderRowsThresholds(): void {
    this.matchThresholdsUi.renderRows();
  }

}
