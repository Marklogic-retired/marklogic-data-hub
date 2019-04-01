import {Component, EventEmitter, Input, Output, ViewChild} from '@angular/core';
import {MatDialog} from '@angular/material';
import {NewStepDialogComponent} from './new-step-dialog.component';
import {IngestComponent} from "../ingest/ingest.component";

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent {
  @Input() step: any;
  @Input() flow: any;
  @Input() databases: any;
  @Input() collections: any;
  @Input() entities: any;
  @Output() updateStep = new EventEmitter();

  @ViewChild(IngestComponent) ingestionStep: IngestComponent;


  showBody = true;
  constructor(
    public dialog: MatDialog
  ) {}
  toggleBody() {
    this.showBody = !this.showBody;
  }
  editSettingsClicked() {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {
        title: 'Edit Step',
        databases: this.databases,
        collections: this.collections,
        entities: this.entities,
        step: this.step
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.updateStep.emit(response);
      }
    });
  }

  saveStep() {
    let step = this.step;
    if (this.step.type === 'ingestion') {
      step = this.ingestionStep.getStep(this.flow);
    }
    console.log('this.updateStep.emit', step);
    this.updateStep.emit(step);
  }

}
