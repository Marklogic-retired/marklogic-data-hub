import {Component, EventEmitter, Input, Output, ViewChild, OnChanges} from '@angular/core';
import {MatDialog} from '@angular/material';
import { StepType } from '../../models/step.model';
import {NewStepDialogComponent} from './new-step-dialog.component';
import {IngestComponent} from "../ingest/ingest.component";
import {MappingComponent} from "../mapping/mapping.component";

@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent implements OnChanges {
  @Input() step: any;
  @Input() flow: any;
  @Input() databases: any;
  @Input() collections: any;
  @Input() entities: any;
  @Input() projectDirectory: any;
  @Input() selectedStepId: string;
  @Input() flowEnded: string;
  @Output() updateStep = new EventEmitter();

  @ViewChild(IngestComponent) ingestionStep: IngestComponent;
  @ViewChild(MappingComponent) mappingStep: MappingComponent;
  @ViewChild('masteringTabGroup') masteringTabGroup;

  public masteringTabIndex: number = 0;

  public stepType: typeof StepType = StepType;
  showBody = true;
  constructor(
    public dialog: MatDialog
  ) {}

  // workaround for: https://github.com/angular/material2/issues/7006
  ngOnChanges(changes: any) {
    if (changes &&
      changes.selectedStepId &&
      this.step.stepDefinitionType === this.stepType.MASTERING &&
      this.step.id === changes.selectedStepId.currentValue) {
      setTimeout(() => {
        this.masteringTabGroup.realignInkBar();
      }, 100);
    }
    if (changes.flowEnded) {
      // reload mapping in case of new source docs
      if (this.mappingStep)
        this.mappingStep.loadMap();
    }
  }

  toggleBody() {
    this.showBody = !this.showBody;
    this.masteringTabIndex = 0;
  }
  editSettingsClicked() {
    const dialogRef = this.dialog.open(NewStepDialogComponent, {
      width: '600px',
      data: {
        title: 'Edit Step',
        databases: this.databases,
        collections: this.collections,
        entities: this.entities,
        step: this.step,
        flow: this.flow,
        isUpdate: true
      }
    });

    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        if (this.mappingStep)
          this.mappingStep.stepEdited(response);
        this.updateStep.emit(response);
      }
    });
  }

  saveStep(stepToSave) {
    let step = this.step;
    if (stepToSave){
      step = stepToSave;
    }
    this.updateStep.emit(step);
  }

}
