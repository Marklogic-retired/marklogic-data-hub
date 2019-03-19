import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MergeStrategy } from "../merge-strategies.model";
import { AddMergeOptionDialogComponent } from './add-merge-option-dialog.component';
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
  @Input() targetEntity: any;

  @Output() createStrategy = new EventEmitter();
  @Output() updateStrategy = new EventEmitter();
  @Output() deleteStrategy = new EventEmitter();

  public displayedColumns = ['strategyName', 'maxValues', 'maxSources', 'sourceWeights', 'length', 'actions'];
  public dataSource: MatTableDataSource<MergeStrategy>;

  public weightFocus: object = {};

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

  // openMergeOptionDialog(strategyToEdit: MergeStrategy, index: number, entityProps: any): void {
  //   const dialogRef = this.dialog.open(AddMergeOptionDialogComponent, {
  //     width: '500px',
  //     data: {strategy: strategyToEdit, index: index, entityProps: entityProps}
  //   });
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (!!result) {
  //       if (strategyToEdit) {
  //         console.log('updateStrategy');
  //         this.updateStrategy.emit(result);
  //       }else{
  //         console.log('createStrategy');
  //         this.createStrategy.emit(result);
  //       }
  //     }
  //   });
  // }

  openConfirmDialog(opt): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Merge Strategy', confirmationMessage: `Delete the option?`}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteStrategy.emit(opt);
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
    this.dataSource.data = this.mergeStrategies.strategies;
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
