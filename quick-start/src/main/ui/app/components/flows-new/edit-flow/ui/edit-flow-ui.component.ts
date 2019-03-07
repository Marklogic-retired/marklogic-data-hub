import { Component, Input, Output, EventEmitter } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewStepDialogComponent } from './new-step-dialog.component';
import { RunFlowDialogComponent } from './run-flow-dialog.component';
import { ConfirmationDialogComponent } from '../../../common';
import { FlowSettingsDialogComponent } from '../../manage-flows/ui/flow-settings-dialog.component';
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
  @Input() entities: any;
  @Output() saveFlow = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();

  constructor(
    public dialog: MatDialog
  ) {}

  openStepDialog(): void {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {title: 'New Step', databases: this.databases, entities: this.entities, step: null}
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        // TODO when adding step, need endpoint to generate step id
        this.flow.steps.push(response);
        console.log('flow after adding step', this.flow);
        this.saveFlow.emit(this.flow);
      }
    });
  }
  openRunDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(RunFlowDialogComponent, {
      width: '600px',
      data: {steps: flow.steps.map(step => step.name)}
    });

    dialogRef.afterClosed().subscribe(response => {
      // TODO add endpoint to run
      console.log('The run dialog was closed', response);
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
        // TODO remove by step id
        const index = this.flow.steps.findIndex(object => object.name === step.name);
        this.flow.steps.splice(index, 1);
        this.saveFlow.emit(this.flow);
      }
    });
  }
  openFlowSettingsDialog(): void {
    const dialogRef = this.dialog.open(FlowSettingsDialogComponent, {
      width: '500px',
      data: {flow: this.flow}
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.flow.name = response.name;
        this.flow.description = response.description;
        this.flow.batchSize = response.batchSize;
        this.flow.threadCount = response.threadCount;
        this.saveFlow.emit(this.flow);
      }
    });
  }
  redeployDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Redeploy Flow?', confirmationMessage: `Redeploy ${this.flow.name} to database?`}
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        // TODO Redeploy endpoint
        console.log('redeploy');
      }
    });
  }
  deleteFlowDialog(): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: 'Delete Flow?', confirmationMessage: `Delete ${this.flow.name}?`}
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.deleteFlow.emit(this.flow.id);
      }
    });
  }
  updateFlow(): void {
    this.saveFlow.emit(this.flow);
  }
  updateStep(step): void {
    // TODO update by step id
    const index = this.flow.steps.findIndex(object => object.name === step.name);
    this.flow.steps[index] = step;
    this.saveFlow.emit(this.flow);
  }
}
