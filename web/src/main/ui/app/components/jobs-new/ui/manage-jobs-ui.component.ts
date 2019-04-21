import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {Router, ActivatedRoute, Params} from '@angular/router';
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
  selector: 'jobs-page-ui',
  templateUrl: './manage-jobs-ui.component.html',
  styleUrls: ['./manage-jobs-ui.component.scss']
})
export class ManageJobsUiComponent implements OnInit, AfterViewInit {
  displayedColumns = ['name', 'status', 'endTime', 'duration', 'committed', 'errors', 'actions'];
  filterValues = {};
  flowValues = [];
  statusValues = [];
  @Input() jobs: Array<any> = [];

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ){}

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.jobs);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item['flowName'];
        case 'duration':
          return differenceInSeconds(item['startTime'], item['endTime']);
        case 'committed':
          return item['successfulEvents'];
        case 'errors':
          return item['failedEvents'];
        default: return item[property];
      }
    };
    // Check all filters across data source
    this.dataSource.filterPredicate = (data: any, filterValues: string) => {
      filterValues = JSON.parse(filterValues);
      let result = true;
      // If text entered, default to false and then check for matches
      if (filterValues['text']) {
        result = false;
        if (data['flowName'].indexOf(filterValues['text']) != -1 ||
            data['id'].indexOf(filterValues['text']) != -1 ||
            // data['targetEntity'].indexOf(filterValues['text']) != -1 ||
            data['status'].indexOf(filterValues['text']) != -1 //||
            // TODO handle search of numbers
            // data['successfulEvents'].toString().indexOf(filterValues['text']) != -1 ||
            // data['failedEvents'].toString().indexOf(filterValues['text']) != -1) {
        ) {
          result = true;
        }
      }
      // If menu selected, set to false if no match
      if (filterValues['flow'] &&
          data['flowName'].indexOf(filterValues['flow']) == -1) {
        result = false;
      }
      // if (filterValues['targetEntity'] &&
      //     data['targetEntity'].indexOf(filterValues['targetEntity']) == -1) {
      //   result = false;
      // }
      if (filterValues['jobStatus'] &&
          data['status'].indexOf(filterValues['jobStatus']) == -1) {
        result = false;
      }
      return result;
    }
    if (this.activatedRoute.snapshot.queryParams['flowName']) {
      this.applyFilter('flow', this.activatedRoute.snapshot.queryParams['flowName']);
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  updateDataSource() {
    this.dataSource.data = this.jobs;
  }

  applyFilter(menu: string, value: string) {
    this.filterValues[menu] = value;
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  clearFilters(): void {
    this.filterValues = {};
    this.dataSource.filter = JSON.stringify(this.filterValues)
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

  viewFlow(job): void {
    this.router.navigate(['/edit-flow', job.flowId]);
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
    this.flowValues = this.getMenuVals('flowName');
    this.statusValues = this.getMenuVals('status');
  }

  friendlyDate(dt): string {
    return (dt) ? moment(dt).fromNow() : '';
  }

  friendlyDuration(dt1, dt2): any {
    moment.relativeTimeThreshold('s', 60);
    moment.relativeTimeThreshold('ss', 3);
    return (dt1 && dt2) ?
      moment.duration(moment(dt1).diff(moment(dt2))).humanize() :
      '';
  }

  getMenuVals(prop) {
    let set = new Set();
    this.jobs.forEach(j => set.add(j[prop]));
    let arr = Array.from(set);
    arr.unshift('');
    return arr;
  }

}
