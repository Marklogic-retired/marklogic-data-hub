import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {ConfirmationDialogComponent} from "../../common";
import {OutputDialogComponent} from "./output-dialog.component";
import {StatusDialogComponent} from "./status-dialog.component";
//import {Flow} from "../../models/flow.model";
import * as moment from 'moment';
import { differenceInSeconds,
         differenceInMinutes,
         differenceInHours,
         differenceInDays } from 'date-fns';

@Component({
  selector: 'job-details-page-ui',
  templateUrl: './job-details-ui.component.html',
  styleUrls: ['./job-details-ui.component.scss']
})
export class JobDetailsUiComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'targetEntity', 'stepStatus', 'timeEnded', 'duration', 'committed', 'errors', 'actions'];
  filterValues = {};
  @Input() job: any;

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog){
  }

  ngOnInit() {
    console.log('this.job', this.job);
    this.dataSource = new MatTableDataSource<any>(this.job['steps']);
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateDataSource() {
    this.dataSource.data = this.job;
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

  openOutputDialog(job): void {
    const dialogRef = this.dialog.open(OutputDialogComponent, {
      width: '500px',
      data: { output: 'The output content'}
    });
  }

  openStatusDialog(job): void {
    const dialogRef = this.dialog.open(StatusDialogComponent, {
      width: '500px',
      data: { statusDetails: 'The status details content'}
    });
  }

  friendlyDate(dt): string {
    return (dt) ? moment(dt).fromNow() : '';
  }

  friendlyDuration(dt1, dt2): any {
    return (dt1 && dt2) ?
      moment.duration(moment(dt1).diff(moment(dt2))).humanize() :
      '';
  }

}
