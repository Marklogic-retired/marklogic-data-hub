import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { NewStepDialogComponent } from './new-step-dialog.component';
import { RunFlowDialogComponent } from './run-flow-dialog.component';
import { ConfirmationDialogComponent } from '../../../common';
import { FlowSettingsDialogComponent } from '../../manage-flows/ui/flow-settings-dialog.component';
import { Flow } from '../../models/flow.model';
import { Step } from '../../models/step.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-edit-flow-ui',
  templateUrl: './edit-flow-ui.component.html',
  styleUrls: ['./edit-flow-ui.component.scss'],
})
export class EditFlowUiComponent implements OnChanges {

  @Input() flow: Flow;
  @Input() flowNames: string[];
  @Input() stepsArray: any;
  @Input() databases: any;
  @Input() entities: any;
  @Input() collections: any;
  @Input() selectedStepId: any;
  @Input() projectDirectory: any;
  @Input() flowEnded: any;
  @Input() runFlowClicked: boolean;
  @Input() disableSelect: boolean;
  @Input() errorResponse: any;
  @Output() runFlow = new EventEmitter();
  @Output() stopFlow = new EventEmitter();
  @Output() saveFlow = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();
  @Output() stepSelected = new EventEmitter();
  @Output() stepCreate = new EventEmitter();
  @Output() stepUpdate = new EventEmitter();
  @Output() stepDelete = new EventEmitter();


  constructor(
    public dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes.flowEnded) {
      this.flowEnded = changes.flowEnded.currentValue;
    }
  }

  openStepDialog(index): void {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {
        title: 'New Step',
        databases: this.databases,
        entities: this.entities,
        step: null,
        flow: this.flow,
        projectDirectory: this.projectDirectory
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

  openRunDialog(): void {
    const dialogRef = this.dialog.open(RunFlowDialogComponent, {
      width: '600px',
      data: {steps: this.flow.steps}
    });

    dialogRef.afterClosed().subscribe(response => {
      if ( response ) {
        const runObject = {
          id: this.flow.id,
          runArray: response
        };
        this.runFlow.emit(runObject);
      }
    });
  }
  openStopDialog(flow: Flow): void {
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '350px',
      data: {title: `${flow.name} is running a job`, confirmationMessage: `Stop the job for "${flow.name}"?`}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!!result) {
        this.stopFlow.emit(flow.id);
      }
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
      data: {flow: this.flow, flowNames: this.flowNames, isUpdate: true}
    });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.flow.name = response.name;
        this.flow.description = response.description;
        this.flow.batchSize = response.batchSize;
        this.flow.threadCount = response.threadCount;
        this.flow.options = response.options;
        this.saveFlow.emit(this.flow);
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

  stepUpdated(step): void {
    this.snackBar.open("Step Saved", "", {
      panelClass: ['snackbar'], 
      duration: 1200
    });
  }

}
