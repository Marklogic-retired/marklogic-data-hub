import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MatchOption } from "../match-options.model";
import { AddMatchOptionDialogComponent } from './add-match-option-dialog.component';
import { ConfirmationDialogComponent } from "../../../../../common";

@Component({
  selector: 'app-match-options-ui',
  templateUrl: './match-options-ui.component.html',
  styleUrls: ['./match-options-ui.component.scss'],
})
export class MatchOptionsUiComponent {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() matchOptions: any;
  @Input() targetEntity: any;
  @Input() targetEntityName: string;

  @Output() createOption = new EventEmitter();
  @Output() updateOption = new EventEmitter();
  @Output() deleteOption = new EventEmitter();

  public displayedColumns = ['propertyName', 'matchType', 'weight', 'other', 'actions'];
  public dataSource: MatTableDataSource<MatchOption>;

  public weightFocus: object = {};

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource<MatchOption>(this.matchOptions.options);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openMatchOptionDialog(optionToEdit: MatchOption, index: number, entityProps: any): void {
    const dialogRef = this.dialog.open(AddMatchOptionDialogComponent, {
      width: '500px',
      data: {option: optionToEdit, index: index, entityProps: entityProps}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (optionToEdit) {
          console.log('updateOption');
          this.updateOption.emit(result);
        }else{
          console.log('createOption');
          this.createOption.emit(result);
        }
      }
    });
  }

  openConfirmDialog(opt): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Match Option', confirmationMessage: `Delete the option?`}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteOption.emit(opt);
      }
    });
  }

  renderRows(): void {
    this.dataSource.data = this.matchOptions['options'];
    this.table.renderRows();
  }

  weightClicked(event, mOpt) {
    event.preventDefault();
    event.stopPropagation();
    this.matchOptions.options.forEach(m => { m.editing = false; })
    mOpt.editing = !mOpt.editing;
    this.weightFocus[mOpt.propertyName] = true;
  }

  weightKeyPress(event, mOpt): void {
    if (event.key === 'Enter') {
      mOpt.editing = !mOpt.editing;
      this.weightFocus[mOpt.propertyName] = false;
    }
  }

  // Close weight input on outside click
  @HostListener('document:click', ['$event', 'this']) weightClickOutside($event, mOpt){
    this.matchOptions.options.forEach(m => { m.editing = false; })
  }

}
