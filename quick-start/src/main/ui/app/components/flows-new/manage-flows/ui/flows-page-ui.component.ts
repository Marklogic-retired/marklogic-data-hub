import {Component, Input, ViewChild} from "@angular/core";
import {MatDialog} from "@angular/material";
import {MatTable} from '@angular/material';
import {ConfirmationDialogComponent} from "../../../common";
import {Flow} from "../../models/flow.model";
import {NewFlowDialogComponent} from "./new-flow-dialog.component";
import {StepIconsUiComponent} from "./step-icons-ui.component";
import * as moment from 'moment';

@Component({
  selector: 'flows-page-ui',
  templateUrl: './flows-page-ui.component.html',
  styleUrls: ['./flows-page-ui.component.scss']
})
export class FlowsPageUiComponent {
  displayedColumns = ['name', 'targetEntity', 'status', 'jobs', 'lastJobFinished', 'successfulEvents', 'failedEvents', 'actions'];
  @Input() flows: Array<Object> = new Array<Object>();

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(public dialog: MatDialog){}

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

  openNewFlowDialog(): void {
    const dialogRef = this.dialog.open(NewFlowDialogComponent, {
      width: '500px'
    });
    dialogRef.afterClosed().subscribe(result => {
      console.log(`Result: ${!!result}`);
    });
  }

  renderRows(): void {
    this.table.renderRows();
  }

  friendlyDate(dt): string {
    return moment(dt).fromNow();
  }

  onDeleteClick(event): void {
    console.log(event)
  }

}
