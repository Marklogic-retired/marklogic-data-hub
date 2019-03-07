import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MatchThreshold } from "../../../models/match-thresholds.model";
import { AddMatchThresholdDialogComponent } from './add-match-threshold-dialog.component';
import { ConfirmationDialogComponent } from "../../../../common";

@Component({
  selector: 'app-match-thresholds-ui',
  templateUrl: './match-thresholds-ui.component.html',
  styleUrls: ['./match-thresholds-ui.component.scss'],
})
export class MatchThresholdsUiComponent {
  displayedColumns = ['label', 'above', 'action', 'actions'];
  @Input() step: any;
  @Input() matchThresholds: any;

  @Output() createThreshold = new EventEmitter();
  @Output() saveThreshold = new EventEmitter();
  @Output() deleteThreshold = new EventEmitter();

  dataSource: MatTableDataSource<MatchThreshold>;

  @ViewChild(MatTable) table: MatTable<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('this.matchThresholds', this.matchThresholds);
    this.dataSource = new MatTableDataSource<MatchThreshold>(this.matchThresholds.thresholds);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openMatchThresholdDialog(thresholdToEdit: MatchThreshold, index: number): void {
    const dialogRef = this.dialog.open(AddMatchThresholdDialogComponent, {
      width: '500px',
      data: {option: thresholdToEdit, index: index}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (thresholdToEdit) {
          console.log('saveThreshold');
          this.saveThreshold.emit(result);
        }else{
          console.log('createThreshold', result);
          this.createThreshold.emit(result);
        }
      }
    });
  }

  openConfirmDialog(index): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Match Threshold', confirmationMessage: `Delete the threshold?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteThreshold.emit(index);
      }
    });
  }

  // TODO Use TruncateCharactersPipe
  truncate(value: string, limit: number, trail: string = '...'): string {
    return value.length > limit ?
      value.substring(0, limit) + trail :
      value;
  }

  updateDataSource() {
    this.dataSource.data = this.matchThresholds['thresholds'];
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

}
