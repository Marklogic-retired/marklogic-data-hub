import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MergeOption } from "../merge-options.model";
import { AddMergeOptionDialogComponent } from './add-merge-option-dialog.component';
import { ConfirmationDialogComponent } from "../../../../../common";

@Component({
  selector: 'app-merge-options-ui',
  templateUrl: './merge-options-ui.component.html',
  styleUrls: ['./merge-options-ui.component.scss'],
})
export class MergeOptionsUiComponent {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() mergeOptions: any;
  @Input() targetEntity: any;

  @Output() createOption = new EventEmitter();
  @Output() updateOption = new EventEmitter();
  @Output() deleteOption = new EventEmitter();

  public displayedColumns = ['propertyName', 'mergeType', 'maxValues', 'maxSources', 'sourceWeights', 'length', 'actions'];
  public dataSource: MatTableDataSource<MergeOption>;

  public weightFocus: object = {};

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('ngOnInit this.mergeOptions', this.mergeOptions);
    this.dataSource = new MatTableDataSource<MergeOption>(this.mergeOptions.options);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openMergeOptionDialog(optionToEdit: MergeOption, index: number, entityProps: any): void {
    const dialogRef = this.dialog.open(AddMergeOptionDialogComponent, {
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

  // TODO Use TruncateCharactersPipe
  truncate(value: string, limit: number, trail: string = '...'): string {
    return value.length > limit ?
      value.substring(0, limit) + trail :
      value;
  }

  renderRows(): void {
    this.dataSource.data = this.mergeOptions.options;
    this.table.renderRows();
  }

  // weightClicked(event, mOpt) {
  //   event.preventDefault();
  //   event.stopPropagation();
  //   this.matchOptions.options.forEach(m => { m.editing = false; })
  //   mOpt.editing = !mOpt.editing;
  //   this.weightFocus[mOpt.propertyName] = true;
  // }

  // weightKeyPress(event, mOpt): void {
  //   if (event.key === 'Enter') {
  //     mOpt.editing = !mOpt.editing;
  //     this.weightFocus[mOpt.propertyName] = false;
  //   }
  // }

  // Close weight input on outside click
  // @HostListener('document:click', ['$event', 'this']) weightClickOutside($event, mOpt){
  //   this.matchOptions.options.forEach(m => { m.editing = false; })
  // }

}
