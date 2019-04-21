import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges} from "@angular/core";
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {ConfirmationDialogComponent} from "../../common";
import {OutputDialogComponent} from "./output-dialog.component";
import {StatusDialogComponent} from "./status-dialog.component";
//import {Flow} from "../../models/flow.model";
import { Job } from '../models/job.model';
import * as moment from 'moment';
import * as _ from "lodash";
import { differenceInSeconds,
         differenceInMinutes,
         differenceInHours,
         differenceInDays } from 'date-fns';

@Component({
  selector: 'job-details-page-ui',
  templateUrl: './job-details-ui.component.html',
  styleUrls: ['./job-details-ui.component.scss']
})
export class JobDetailsUiComponent implements OnChanges {
  displayedColumns = ['name', 'status', 'endTime', 'duration', 'committed', 'errors', 'actions'];
  filterValues = {};
  @Input() job: Job;

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog){
  }

  // ngOnInit() {
    // console.log('this.job', this.job);
    // TODO handle capitalization with CSS
    // this.job.status = _.capitalize(this.job.status);
    // this.dataSource = new MatTableDataSource<any>(this.job['steps']);
  // }

  // ngAfterViewInit() {
    // this.dataSource.paginator = this.paginator;
    // this.dataSource.sort = this.sort;
  // }
  ngOnChanges(changes: SimpleChanges) {
    console.log('job changes', changes);
    if ( changes.hasOwnProperty('job')) {
      if (!changes.job.firstChange && changes.job.currentValue ) {
        this.renderRows();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }
  }

  updateDataSource() {
    console.log('this.job data source', this.job);
    this.dataSource = new MatTableDataSource<any>(this.job.steps);
  }

  renderRows(): void {
    this.updateDataSource();
    // this.table.renderRows();
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
    let result = (dt) ? moment(dt).fromNow() : '';
    // TODO handle capitalization with CSS
    return _.capitalize(result);
  }

  friendlyDuration(dt1, dt2): any {
    moment.relativeTimeThreshold('s', 60);
    moment.relativeTimeThreshold('ss', 3);
    let result = (dt1 && dt2) ?
      moment.duration(moment(dt1).diff(moment(dt2))).humanize() :
      '';
    // TODO handle capitalization with CSS
    return _.capitalize(result);
  }

}
