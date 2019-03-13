import { Component, Input, Output, EventEmitter, OnInit, ViewChild, HostListener } from '@angular/core';
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
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() matchThresholds: any;

  @Output() createThreshold = new EventEmitter();
  @Output() updateThreshold = new EventEmitter();
  @Output() deleteThreshold = new EventEmitter();

  public displayedColumns = ['label', 'above', 'action', 'actions'];
  public dataSource: MatTableDataSource<MatchThreshold>;

  public weightFocus: object = {};

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
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
          this.updateThreshold.emit(result);
        }else{
          console.log('createThreshold', result);
          this.createThreshold.emit(result);
        }
      }
    });
  }

  openConfirmDialog(thr): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Match Threshold', confirmationMessage: `Delete the threshold?`}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteThreshold.emit(thr);
      }
    });
  }

  // TODO Use TruncateCharactersPipe
  truncate(value: string, limit: number, trail: string = '...'): string {
    return value.length > limit ?
      value.substring(0, limit) + trail :
      value;
  }

  renderRows(): void {
    this.dataSource.data = this.matchThresholds['thresholds'];
    this.table.renderRows();
  }

  weightClicked(event, mThr) {
    event.preventDefault();
    event.stopPropagation();
    this.matchThresholds.thresholds.forEach(m => { m.editing = false; })
    mThr.editing = !mThr.editing;
    this.weightFocus[mThr.label] = true;
  }

  weightKeyPress(event, mThr): void {
    if (event.key === 'Enter') {
      mThr.editing = !mThr.editing;
      this.weightFocus[mThr.label] = false;
    }
  }

  // Close weight input on outside click
  @HostListener('document:click', ['$event', 'this']) weightClickOutside($event, mThr){
    this.matchThresholds.thresholds.forEach(m => { m.editing = false; })
  }

}
