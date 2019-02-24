import {Component, Input} from "@angular/core";
import {MatDialog} from "@angular/material";
import {ConfirmationDialogComponent} from "../../../common";
import {FlowModel} from "../../models/flow.model";
import {NewFlowDialogComponent} from "./new-flow-dialog.component";

@Component({
  selector: 'flows-page-ui',
  templateUrl: './flows-page-ui.component.html',
  styleUrls: ['./flows-page-ui.component.scss']
})
export class FlowsPageUiComponent {
  displayedColumns = ['name', 'targetEntity', 'status', 'jobs', 'lastJobFinished', 'docsCommitted', 'docsFailed', 'actions'];
  @Input() flows;

  constructor(public dialog: MatDialog){}

  openPlayDialog() {}

  openConfirmDialog(flow: FlowModel): void {
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
}
