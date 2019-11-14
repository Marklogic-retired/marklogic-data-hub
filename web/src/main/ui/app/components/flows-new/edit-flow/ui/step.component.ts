import {Component, EventEmitter, Input, Output, ViewChild, OnChanges} from '@angular/core';
import {MatDialog} from '@angular/material';
import { StepType } from '../../models/step.model';
import {NewStepDialogComponent} from './new-step-dialog.component';
import {IngestComponent} from "../ingest/ingest.component";
import {MappingComponent} from "../mapping/mapping.component";
import {MatchingComponent} from "../mastering/matching/matching.component";
import {MergingComponent} from "../mastering/merging/merging.component";

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
  @Input() sourceQuery: string;
  @Input() targetEntityName: string;
  @Output() updateStep = new EventEmitter();

  @ViewChild(IngestComponent) ingestionStep: IngestComponent;
  @ViewChild(MappingComponent) mappingStep: MappingComponent;
  @ViewChild(MatchingComponent) matchingStep: MatchingComponent;
  @ViewChild(MergingComponent) mergingStep: MatchingComponent;
  @ViewChild('masteringTabGroup') masteringTabGroup;

  public masteringTabIndex: number = 0;

  public stepType: typeof StepType = StepType;
  showBody = true;
  constructor(
    public dialog: MatDialog
  ) {}

  ngOnChanges(changes: any) {
    // workaround for: https://github.com/angular/material2/issues/7006
    if (changes &&
      changes.selectedStepId &&
      this.createStepHeader(this.step) === this.stepType.MASTERING &&
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
    if (changes.sourceQuery) {
      // reset source doc URI on source change
      if (this.mappingStep)
        this.mappingStep.sourceChanged();
    }
    if (changes.targetEntityName) {
      // reload matching/merging in case of new target entity
      if (this.matchingStep)
        this.matchingStep.getEntity(this.targetEntityName);
      if (this.matchingStep)
        this.mergingStep.getEntity(this.targetEntityName);
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

  createStepHeader(step: any): string {
    if (step.stepDefinitionType === this.stepType.INGESTION){
      if(step.stepDefinitionName === 'default-ingestion'){
        return 'INGESTION';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === this.stepType.MAPPING){
      if(step.stepDefinitionName === 'default-mapping' || step.stepDefinitionName === 'entity-services-mapping'){
        return 'MAPPING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === this.stepType.MATCHING){
      if(step.stepDefinitionName === 'default-matching'){
        return 'MATCHING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === this.stepType.MERGING){
      if(step.stepDefinitionName === 'default-merging'){
        return 'MERGING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else if (step.stepDefinitionType === this.stepType.MASTERING){
      if(step.stepDefinitionName === 'default-mastering'){
        return 'MASTERING';
      }
      else{
        return 'CUSTOM';
      }
    }
    else {
        return 'CUSTOM';
    }
  }

}
