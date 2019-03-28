import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material';
import { NewStepDialogComponent } from './new-step-dialog.component';
import { MatchingComponent } from '../mastering/matching/matching.component';
import { MergingComponent } from '../mastering/merging/merging.component';

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent {
  @Input() step: any;
  @Input() databases: any;
  @Input() collections: any;
  @Input() entities: any;
  @Output() updateStep = new EventEmitter();

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

  saveStep(event) {
    console.log('this.updateStep.emit', event);
    this.updateStep.emit(event);
  }

}
