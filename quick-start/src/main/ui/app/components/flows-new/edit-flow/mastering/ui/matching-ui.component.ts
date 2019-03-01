import { Component, Input, Output, EventEmitter, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MatchOption } from "../../../models/match-options.model";
import { AddMatchOptionDialogComponent } from './add-match-option-dialog.component';
import { ConfirmationDialogComponent } from "../../../../common";

@Component({
  selector: 'app-matching-ui',
  templateUrl: './matching-ui.component.html',
  styleUrls: ['./matching-ui.component.scss'],
})
export class MatchingUiComponent {
  displayedColumns = ['propertyName', 'matchType', 'weight', 'other', 'actions'];
  @Input() step: any;
  @Input() matchOptions: any;
  @Input() matchThresholds: any;

  @Output() createOption = new EventEmitter();
  @Output() saveOption = new EventEmitter();
  @Output() deleteOption = new EventEmitter();

  dataSource: MatTableDataSource<MatchOption>;

  @ViewChild(MatTable) table: MatTable<any>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('this.matchOptions', this.matchOptions);
    this.dataSource = new MatTableDataSource<MatchOption>(this.matchOptions.options);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openMatchOptionDialog(optionToEdit: MatchOption, index: number): void {
    const dialogRef = this.dialog.open(AddMatchOptionDialogComponent, {
      width: '500px',
      data: {option: optionToEdit, index: index}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (optionToEdit) {
          console.log('saveOption');
          this.saveOption.emit(result);
        }else{
          console.log('createOption');
          this.createOption.emit(result);
        }
      }
    });
  }

  openConfirmDialog(index): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Match Option', confirmationMessage: `Delete the option?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteOption.emit(index);
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
    this.dataSource.data = this.matchOptions['options'];
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

}
