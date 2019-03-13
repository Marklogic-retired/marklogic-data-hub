import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {MatDialog, MatPaginator, MatSort, MatTable, MatTableDataSource} from "@angular/material";
import {ConfirmationDialogComponent} from "../../../common";
import {FlowSettingsDialogComponent} from "./flow-settings-dialog.component";
import {Flow} from "../../models/flow.model";
import * as moment from 'moment';
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

  openRunDialog(flow: Flow) {
    const dialogRef = this.dialog.open(RunFlowDialogComponent, {
      width: '600px',
      data: {steps: flow.steps.map(step => step.name)}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The run dialog was closed');
    });
  }

  openConfirmDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Flow', confirmationMessage: `Delete the flow "${flow.name}"?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if(!!result){
        this.deleteFlow.emit(result);
      }
    });
  }

  openFlowSettingsDialog(flowToEdit: Flow): void {
    const dialogRef = this.dialog.open(FlowSettingsDialogComponent, {
      width: '500px',
      data: {flow: flowToEdit}
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

  renderRows(): void {
    this.updateDataSource();
    this.table.renderRows();
  }

  friendlyDate(dt): string {
    return (dt) ? moment(dt).fromNow() : '';
  }

}
