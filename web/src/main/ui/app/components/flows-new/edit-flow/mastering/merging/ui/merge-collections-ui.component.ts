import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MergeCollection } from "../merge-collections.model";
import { AddMergeCollectionDialogComponent } from './add-merge-collection-dialog.component';
import { ConfirmationDialogComponent } from "../../../../../common";

@Component({
  selector: 'app-merge-collections-ui',
  templateUrl: './merge-collections-ui.component.html',
  styleUrls: ['./merge-collections-ui.component.scss'],
})
export class MergeCollectionsUiComponent {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @Input() mergeCollections: any;

  @Output() createCollection = new EventEmitter();
  @Output() updateCollection = new EventEmitter();
  @Output() deleteCollection = new EventEmitter();

  public displayedColumns = ['event', 'add', 'remove', 'set', 'actions'];
  public dataSource: MatTableDataSource<MergeCollection>;

  public weightFocus: object = {};

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('ngOnInit this.mergeCollections', this.mergeCollections);
    this.dataSource = new MatTableDataSource<MergeCollection>(this.mergeCollections.collections);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  openMergeCollectionDialog(collectionToEdit: MergeCollection, index: number): void {
    const dialogRef = this.dialog.open(AddMergeCollectionDialogComponent, {
      width: '500px',
      data: { collection: collectionToEdit, index: index }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (collectionToEdit) {
          console.log('updateCollection');
          this.updateCollection.emit(result);
        }else{
          console.log('createCollection');
          this.createCollection.emit(result);
        }
      }
    });
  }

  openConfirmDialog(coll): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Collection Event', confirmationMessage: `Delete the event?`}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteCollection.emit(coll);
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
    this.dataSource.data = this.mergeCollections.collections;
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
