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
  @Input() stepsArray: any;
  @Input() databases: any;
  @Input() entities: any;
  @Input() collections: any;
  @Output() runFlow = new EventEmitter();
  @Output() stopFlow = new EventEmitter();
  @Output() saveFlow = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();
  @Output() stepCreate = new EventEmitter();
  @Output() stepUpdate = new EventEmitter();
  @Output() stepDelete = new EventEmitter();

  constructor(
    public dialog: MatDialog
  ) {}

  openStepDialog(index): void {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {
        title: 'New Step',
        databases: this.databases,
        entities: this.entities,
        collections: this.collections,
        step: null
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        const stepObject = {
          step: response,
          index: index
        };
        this.stepCreate.emit(stepObject);
      }
    });
  }
  openRunDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(RunFlowDialogComponent, {
      width: '600px',
      data: {steps: this.stepsArray.map(step => step.name)}
    });

    dialogRef.afterClosed().subscribe(response => {
      // TODO add ability to run individual steps
      console.log('The run dialog was closed', response);
      this.runFlow.emit(this.flow.id);
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
        this.stepDelete.emit(step.id);
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
    this.stepUpdate.emit(step);
  }
}
