import { Component, Input, Output, EventEmitter, OnInit, AfterViewInit, OnChanges, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { MatDialog, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { MergeCollection, Event } from "../merge-collections.model";
import { AddMergeCollectionDialogComponent } from './add-merge-collection-dialog.component';
import { ConfirmationDialogComponent } from "../../../../../common";

@Component({
  selector: 'app-merge-collections-ui',
  templateUrl: './merge-collections-ui.component.html',
  styleUrls: ['./merge-collections-ui.component.scss'],
})
export class MergeCollectionsUiComponent {
  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatSort) sort: MatSort;

  @Input() mergeCollections: any;
  @Input() defaultCollections: any;

  @Output() editCollection = new EventEmitter();

  public displayedColumns = ['event', 'defaults', 'add', 'actions'];
  public dataSource: MatTableDataSource<any>;

  public weightFocus: object = {};

  constructor(
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    console.log('ngOnInit this.mergeCollections', this.mergeCollections);
    // Set up table with empty source, then wait for changes
    this.dataSource = new MatTableDataSource<any>([]);
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.mergeCollections && changes.mergeCollections.currentValue) {
      this.mergeCollections = changes.mergeCollections.currentValue;
    }
    if (changes.defaultCollections && changes.defaultCollections.currentValue) {
      this.defaultCollections = changes.defaultCollections.currentValue;
    }
    // If both have loaded, update table
    if (this.defaultCollections && this.mergeCollections) {
      this.renderRows();
    }
  }

  openMergeCollectionDialog(collectionToEdit: MergeCollection): void {
    const dialogRef = this.dialog.open(AddMergeCollectionDialogComponent, {
      width: '500px',
      data: { collection: collectionToEdit }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        console.log('editCollection');
        this.editCollection.emit(result);
      }
    });
  }

  renderRows(): void {
    this.dataSource.data = this.transformCollections(this.mergeCollections.collections);
    this.table.renderRows();
  }

  transformCollections(colls) {
    let result = [
      { 
        event: Event.ONMERGE,
        defaults: this.defaultCollections[Event.ONMERGE],
        add: []
      },
      { 
        event: Event.ONNOMATCH,
        defaults: this.defaultCollections[Event.ONNOMATCH],
        add: []
      },
      { 
        event: Event.ONARCHIVE,
        defaults: this.defaultCollections[Event.ONARCHIVE],
        add: []
      },
      { 
        event: Event.ONNOTIFICATION,
        defaults: this.defaultCollections[Event.ONNOTIFICATION],
        add: []
      }
    ];
    colls.forEach(c => {
      let found = result.find(r => {
        return r.event === c.event;
      })
      if (found) {
        found.add = found.add.concat(c.add);
      }
    })
    return result;
  }

}
