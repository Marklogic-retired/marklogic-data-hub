import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MergeStrategy } from "../merge-strategies.model";
import { AddMergeStrategyDialogComponent } from './add-merge-strategy-dialog.component';
import { ConfirmationDialogComponent } from "../../../../../common";

@Component({
  selector: 'app-merge-strategies-ui',
  templateUrl: './merge-strategies-ui.component.html',
  styleUrls: ['./merge-strategies-ui.component.scss'],
})
export class MergeStrategiesUiComponent {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() mergeStrategies: any;

  @Output() createStrategy = new EventEmitter();
  @Output() updateStrategy = new EventEmitter();
  @Output() deleteStrategy = new EventEmitter();

  public displayedColumns = ['strategyName', 'maxValues', 'maxSources', 'sourceWeights', 'length', 'actions'];
  public dataSource: MatTableDataSource<MergeStrategy>;

  public valueFocus: object = {};

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('ngOnInit this.mergeStrategies', this.mergeStrategies);
    this.dataSource = new MatTableDataSource<MergeStrategy>(this.mergeStrategies.strategies);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openMergeStrategyDialog(strategyToEdit: MergeStrategy, index: number): void {
    const dialogRef = this.dialog.open(AddMergeStrategyDialogComponent, {
      width: '500px',
      data: { strategy: strategyToEdit, index: index }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (strategyToEdit) {
          console.log('updateStrategy');
          this.updateStrategy.emit(result);
        }else{
          console.log('createStrategy');
          this.createStrategy.emit(result);
        }
      }
    });
  }

  openConfirmDialog(str): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {
        title: 'Delete Merge Strategy',
        confirmationMessage: `Delete the strategy? Warning: Any merge options defined with this strategy will also be deleted.`}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteStrategy.emit(str);
      }
    });
  }

  renderRows(): void {
    this.dataSource.data = this.mergeStrategies.strategies;
    this.table.renderRows();
  }

  valueClicked(event, mStr, type) {
    event.preventDefault();
    event.stopPropagation();
    this.mergeStrategies.strategies.forEach(m => { m.editing = false; })
    mStr.editing = type;
    this.valueFocus[mStr.propertyName] = true;
  }

  valueKeyPress(event, mOpt, index, type): void {
    if (event.key === 'Enter') {
      mOpt.editing = '';
      this.valueFocus[mOpt.propertyName] = false;
      this.updateStrategy.emit({str: mOpt, index: index});
    }
  }

  getIdSW(sw, index) {
    return sw.source.name + '%%%' + index;
  }

  // Close value input on outside click
  @HostListener('document:click', ['$event', 'this']) valueClickOutside($event, mOpt){
    this.mergeStrategies.strategies.forEach(m => { m.editing = ''; })
  }

}
