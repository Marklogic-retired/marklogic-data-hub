import { Component, Input, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewStepDialogComponent } from './new-step-dialog.component';
import { RunFlowDialogComponent } from './run-flow-dialog.component';
import { Flow } from "../../models/flow.model";

@Component({
  selector: 'app-edit-flow-ui',
  templateUrl: './edit-flow-ui.component.html',
  styleUrls: ['./edit-flow-ui.component.scss'],
})
export class EditFlowUiComponent {

  @Input() flow: Flow;
  stepName: string;
  stepType: string;
  steps: [];

  constructor(
    public dialog: MatDialog
  ) {}

  openStepDialog(): void {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {stepName: this.stepName, stepType: this.stepType}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
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

}
