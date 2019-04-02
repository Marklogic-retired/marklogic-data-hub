import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {ConfirmationDialogComponent} from "../../common";
//import {OutputDialogComponent} from "./output-dialog.component";
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
  displayedColumns = ['name', 'targetEntity', 'jobStatus', 'timeEnded', 'duration', 'committed', 'errors', 'actions'];
  filterValues = {};
  @Input() jobs: Array<any> = [];

  dataSource: MatTableDataSource<any>;

  @ViewChild(MatTable) table: MatTable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog){
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource<any>(this.jobs);
    this.dataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item['flow'];
        case 'duration':
          return differenceInSeconds(item['timeStarted'], item['timeEnded']);
        default: return item[property];
      }
    };
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
    // Check all filters across data source
    this.dataSource.filterPredicate = (data: any, filterValues: string) => {
      filterValues = JSON.parse(filterValues);
      let result = true;
      // If text entered, default to false and then check for matches
      if (filterValues['text']) {
        result = false;
        if (data['flow'].indexOf(filterValues['text']) != -1 ||
            data['jobId'].indexOf(filterValues['text']) != -1 ||
            data['targetEntity'].indexOf(filterValues['text']) != -1 ||
            data['jobStatus'].indexOf(filterValues['text']) != -1 ||
            data['committed'].toString().indexOf(filterValues['text'] != -1) ||
            data['errors'].toString().indexOf(filterValues['text'] != -1)) {
          result = true;
        }
      }
      // If menu selected, set to false if no match
      if (filterValues['flow'] &&
          data['flow'].indexOf(filterValues['flow']) == -1) {
        result = false;
      }
      if (filterValues['targetEntity'] &&
          data['targetEntity'].indexOf(filterValues['targetEntity']) == -1) {
        result = false;
      }
      if (filterValues['jobStatus'] &&
          data['jobStatus'].indexOf(filterValues['jobStatus']) == -1) {
        result = false;
      }
      return result;
    }
    this.dataSource.filter = JSON.stringify(this.filterValues)
  }

  openOutputDialog(job) {
    // TODO open output popup
    return false;
  }

  viewFlow(job) {
    // TODO route to flow view
    return false;
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

  friendlyDate(dt): string {
    return (dt) ? moment(dt).fromNow() : '';
  }

  friendlyDuration(dt1, dt2): any {
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
