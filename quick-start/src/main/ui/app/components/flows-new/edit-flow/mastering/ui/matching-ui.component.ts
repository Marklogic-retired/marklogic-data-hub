import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MatchOption } from "../../../models/match-options.model";
import { MatchOptionsUiComponent } from "./match-options-ui.component";
import { AddMatchOptionDialogComponent } from './add-match-option-dialog.component';
import { ConfirmationDialogComponent } from "../../../../common";

@Component({
  selector: 'app-matching-ui',
  templateUrl: './matching-ui.component.html',
  styleUrls: ['./matching-ui.component.scss'],
})
export class MatchingUiComponent {

  @ViewChild(MatchOptionsUiComponent) matchOptionsUi: MatchOptionsUiComponent;

  @Input() step: any;
  @Input() matchOptions: any;
  @Input() matchThresholds: any;

  @Output() createOption = new EventEmitter();
  @Output() saveOption = new EventEmitter();
  @Output() deleteOption = new EventEmitter();

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

  renderRows(): void {
    this.matchOptionsUi.renderRows();
  }

}
