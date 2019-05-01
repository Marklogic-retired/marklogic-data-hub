import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild, OnChanges, SimpleChanges} from "@angular/core";
import { MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import { ConfirmationDialogComponent } from "../../common";
import { StatusDialogComponent } from "./status-dialog.component";
import { Job } from '../models/job.model';
import { StepType } from '../../flows-new/models/step.model';
import * as moment from 'moment';
import * as _ from "lodash";

@Component({
  selector: 'job-details-page-ui',
  templateUrl: './job-details-ui.component.html',
  styleUrls: ['./job-details-ui.component.scss']
})
export class JobDetailsUiComponent implements OnChanges {
  displayedColumns = ['name', 'stepType', 'status', 'endTime', 'duration', 'committed', 'errors'];
  filterValues = {};
  targetDatabase = 'STAGING';
  @Input() job: Job;

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog){
  }

  ngOnInit() {
    // TODO handle capitalization with CSS
    if (this.job) {
      this.job.status = _.capitalize(this.job.status);
      this.updateDataSource();
    } else {
      this.job = Job.fromJSON({ status: 'Loading...' });
    }
  }

  ngAfterViewInit() {
    if (this.dataSource) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }
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
    this.job.steps.forEach((step) => {
      if (step.targetDatabase) {
        step.targetDatabase = /FINAL/.test(step.targetDatabase) ? 'FINAL' : 'STAGING';
      } else if (step.stepDefinitionType.toLowerCase() === StepType.INGESTION.toLowerCase()) {
        step.targetDatabase = 'STAGING';
      } else {
        step.targetDatabase = 'FINAL';
      }
      if (step.success) {
        this.targetDatabase = step.targetDatabase;
      }
    });
    this.dataSource = new MatTableDataSource<any>(this.job.steps);
  }

  renderRows(): void {
    this.updateDataSource();
    // this.table.renderRows();
  }

  openStatusDialog(details): void {
    const dialogRef = this.dialog.open(StatusDialogComponent, {
      width: '700px',
      data: { statusDetails: details}
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

  formatStatus(status):string {
    return _.capitalize(status.replace(/_/g,' ').replace(/-/g,' '));
  }

  hasOutput(step) {
    return step.stepOutput;
  }

  getOutput(step) {
    return (step.stepOutput) ? step.stepOutput[0] : 'No output found';
  }

}
