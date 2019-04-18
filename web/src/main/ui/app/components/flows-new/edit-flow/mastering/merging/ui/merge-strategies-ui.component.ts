import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MergeStrategy } from "../merge-strategies.model";
import { AddMergeStrategyDialogComponent } from './add-merge-strategy-dialog.component';
import { ConfirmationDialogComponent } from "../../../../../common";
import * as _ from 'lodash';

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
  @Input() timestamp: string;

  @Output() createStrategy = new EventEmitter();
  @Output() updateStrategy = new EventEmitter();
  @Output() deleteStrategy = new EventEmitter();
  @Output() saveTimestamp = new EventEmitter();

  public displayedColumns = ['strategyName', 'maxValues', 'maxSources', 'sourceWeights', 'length', 'actions'];
  public dataSource: MatTableDataSource<MergeStrategy>;

  public valueFocus: object = {};

  public timestampOrig: string;
  public mergeStrategyMod: MergeStrategy;

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('ngOnInit this.mergeStrategies', this.mergeStrategies);
    this.dataSource = new MatTableDataSource<MergeStrategy>(this.mergeStrategies.strategies);
    this.timestampOrig = this.timestamp;
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
          this.updateStrategy.emit({str: result.str, index: result.index});
        } else {
          if (result.str.default === 'true' &&  (this.mergeStrategies.strategies && this.findStrategyIndex('default') > -1)) {
            console.log('update existing default Strategy ??');
            this.openDefaultMergeStartegyPopup(result.str, this.findStrategyIndex('default'));
          } else {
            console.log('createStrategy');
            this.createStrategy.emit(result);
          }
        }
      }
    });
  }

  findStrategyIndex(strategyName) {
    return this.mergeStrategies.strategies.findIndex(s => {
      return s.name === strategyName;
    });
  }

  openDefaultMergeStartegyPopup(strategy, index): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '390px',
      data: {
        title: 'Update Default Merge Strategy',
        confirmationMessage: `A default merge strategy already exists. Do you want to replace it?`
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log('result', result);
      if (result) {
        this.updateStrategy.emit({str: strategy, index: index});
      } else {
        return false;
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
    this.mergeStrategies.strategies.forEach(m => { m.editing = ''; })
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
    this.mergeStrategies.strategies.forEach((m, i) => {
      if (m.editing) {
        this.updateStrategy.emit({str: m, index: i});
        m.editing = '';
      }
    })
  }

  onSaveTimestamp() {
    this.saveTimestamp.emit(this.timestamp);
    this.timestampOrig = this.timestamp;
  }
  timestampChanged() {
    return !_.isEqual(this.timestamp, this.timestampOrig);
  }

}
