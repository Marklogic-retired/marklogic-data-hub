import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {ConfirmationDialogComponent} from "../../../common";
import {FlowSettingsDialogComponent} from "./flow-settings-dialog.component";
import {Flow} from "../../models/flow.model";
import * as moment from 'moment';

@Component({
  selector: 'flows-page-ui',
  templateUrl: './manage-flows-ui.component.html',
  styleUrls: ['./manage-flows-ui.component.scss']
})
export class ManageFlowsUiComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'targetEntity', 'status', 'jobsNumber', 'lastJobFinished', 'docsCommitted', 'docsFailed', 'actions'];
  @Input() flows: Array<Flow> = [];
  @Output() deleteFlow = new EventEmitter();
  @Output() createFlow = new EventEmitter();

  dataSource: MatTableDataSource<Flow>;

  @ViewChild(MatTable)
  table: MatTable<any>;

  @ViewChild(MatPaginator)
  paginator: MatPaginator;

  @ViewChild(MatSort)
  sort: MatSort;

  constructor(public dialog: MatDialog){
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<Flow>(this.flows);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateDataSource() {
    this.dataSource.data = this.flows
  }

  openPlayDialog() {}

  openConfirmDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '250px',
      data: {title: 'Flow Deletion', confirmationMessage: `You are about to delete "${flow.name}" flow. Are you sure?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        console.log(`Flow "${flow.name}" is ready to be deleted`);
      }
    });
  }

  openFlowsettingsDialog(flowToEdit: Flow): void {
    const dialogRef = this.dialog.open(FlowSettingsDialogComponent, {
      width: '500px',
      data: {flow: flowToEdit}
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Result: ${!!result}`);
    });
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

  friendlyDate(dt): string {
    return moment(dt).fromNow();
  }

}
