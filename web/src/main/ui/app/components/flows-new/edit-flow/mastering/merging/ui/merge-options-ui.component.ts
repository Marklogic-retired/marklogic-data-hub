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
  @Input() targetEntityName: string;
  @Input() mergeStrategies: any;

  @Output() createOption = new EventEmitter();
  @Output() updateOption = new EventEmitter();
  @Output() deleteOption = new EventEmitter();

  public displayedColumns = ['propertyName', 'mergeType', 'details', 'maxValues', 'maxSources', 'sourceWeights', 'length', 'actions'];
  public dataSource: MatTableDataSource<MergeOption>;

  public valueFocus: object = {};

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

  openMergeOptionDialog(optionToEdit: MergeOption, index: number, entityProps: any, strategies: any): void {
    // Don't allow editing of strategies from Merge Options table
    // if (optionToEdit && optionToEdit.strategy) return;
    const dialogRef = this.dialog.open(AddMergeOptionDialogComponent, {
      width: '500px',
      data: {option: optionToEdit, index: index, entityProps: entityProps, strategies: this.mergeStrategies}
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

  valueClicked(event, mOpt, type) {
    console.log('valueClicked', type);
    event.preventDefault();
    event.stopPropagation();
    this.mergeOptions.options.forEach(m => { m.editing = false; })
    mOpt.editing = type;
    this.valueFocus[mOpt.propertyName] = true;
  }

  valueKeyPress(event, mOpt, type): void {
    console.log('valueKeyPress', type);
    if (event.key === 'Enter') {
      mOpt.editing = '';
      this.valueFocus[mOpt.propertyName] = false;
    }
  }

  getIdSW(sw, index) {
    return sw.source.name + '%%%' + index;
  }

  // Close value input on outside click
  @HostListener('document:click', ['$event', 'this']) valueClickOutside($event, mOpt){
    this.mergeOptions.options.forEach(m => { m.editing = ''; })
  }

}
