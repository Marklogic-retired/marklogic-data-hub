import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewStepDialogComponent } from './new-step-dialog.component';
import { RunFlowDialogComponent } from './run-flow-dialog.component';
import { ConfirmationDialogComponent } from '../../../common';
import { Flow } from '../../models/flow.model';
import { Step } from '../../models/step.model';

@Component({
  selector: 'app-edit-flow-ui',
  templateUrl: './edit-flow-ui.component.html',
  styleUrls: ['./edit-flow-ui.component.scss'],
})
export class EditFlowUiComponent {

  @Input() flow: Flow;
  @Input() databases: any;
  newFlow: Flow;

  constructor(
    public dialog: MatDialog
  ) {}

  openStepDialog(): void {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {databases: this.databases}
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        // TODO Add Step to backend
        this.flow.steps.push(response);
      }
    });
  }
  openRunDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(RunFlowDialogComponent, {
      width: '600px',
      data: {steps: flow.steps.map(step => step.name)}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The run dialog was closed');
    });
  }
  deleteStepDialog(step: Step): void {
    console.log('delete step', step);
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Step?', confirmationMessage: `Delete ${step.name}?`}
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        // TODO Delete from backend and remove by step id
        const index = this.flow.steps.findIndex(object => object.name === step.name);
        this.flow.steps.splice(index, 1);
      }
    });


  }
}
