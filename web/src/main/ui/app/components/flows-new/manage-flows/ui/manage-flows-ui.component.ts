import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {ConfirmationDialogComponent} from "../../../common";
import {FlowSettingsDialogComponent} from "./flow-settings-dialog.component";
import {Flow} from "../../models/flow.model";
import * as moment from 'moment';
import * as _ from "lodash";
import {RunFlowDialogComponent} from "../../edit-flow/ui/run-flow-dialog.component";

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
  @Output() saveFlow = new EventEmitter();
  @Output() runFlow = new EventEmitter();
  @Output() stopFlow = new EventEmitter();
  @Output() redeployModules = new EventEmitter();

  dataSource: MatTableDataSource<Flow>;
  runningStatus = false;

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

  openRunDialog(flow: Flow) {
    const dialogRef = this.dialog.open(RunFlowDialogComponent, {
      width: '600px',
      data: {steps: flow.steps}
    });

    dialogRef.afterClosed().subscribe(response => {
      console.log('The run dialog was closed');
      if ( response ) {
        const runObject = {
          id: flow.id,
          runArray: response
        };
        this.runFlow.emit(runObject);
      }
    });
  }

  openConfirmDeleteDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Flow', confirmationMessage: `Delete the flow "${flow.name}"?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteFlow.emit(flow.id);
      }
    });
  }

  openConfirmRedeployDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Redeploy', confirmationMessage: "Redeploy all flows to database?"}
    });
    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.redeployModules.emit();
      }
    });
  }

  openFlowSettingsDialog(flowToEdit: Flow): void {
    const dialogRef = this.dialog.open(FlowSettingsDialogComponent, {
      width: '500px',
      data: {
        flow: flowToEdit,
        flowNames: _.map(this.flows, flow => flow.name),
        isUpdate: !!flowToEdit
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        if (flowToEdit) {
          this.saveFlow.emit(result);
        }else{
          this.createFlow.emit(result);
        }
      }
    });
  }

  openStopDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: `${flow.name} is running a job`, confirmationMessage: `Stop the job for "${flow.name}"?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.stopFlow.emit(flow.id);
      }
    });
  }

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

  friendlyDate(dt): string {
    return (dt) ? _.capitalize(moment(dt).fromNow()) : '';
  }
  formatStatus(status):string {
    return _.capitalize(status.replace(/_/g,' ').replace(/-/g,' '));
  }

  checkRunStatus(flow: Flow): boolean {
    if ( flow.latestJob && flow.latestJob.status ) {
      let runStatus = flow.latestJob.status.replace('_', ' ');
      runStatus = runStatus.replace('-', ' ');
      runStatus = runStatus.split(' ');
      if ( runStatus[0] === 'running' ) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

}
