import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterContentChecked } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import * as moment from 'moment';
import { StepType } from '../../models/step.model';
import * as _ from "lodash";

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper implements OnChanges, AfterContentChecked {

  @Input() flow: any;
  @Input() stepsArray: any;
  @Output() newStep = new EventEmitter();
  @Output() runFlow = new EventEmitter();
  @Output() stopFlow = new EventEmitter();
  @Output() stepSelected = new EventEmitter();
  @Output() deleteStep = new EventEmitter();
  @Output() editFlow = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();
  @Output() updateFlow = new EventEmitter();

  public stepType: typeof StepType = StepType;
  showBody = true;
  stepAdded = false;
  status = '';

  ngOnChanges(changes: SimpleChanges) {
    if ( changes.hasOwnProperty('flow')) {
      if (!changes.flow.firstChange && changes.flow.currentValue.steps.length > changes.flow.previousValue.steps.length ) {
        this.stepAdded = true;
      }
      // console.log('changes', changes);
      if (!changes.flow.firstChange && changes.flow.currentValue.latestJob.status !== changes.flow.previousValue.latestJob.status) {
        this.status = changes.flow.currentValue.latestJob.status.replace('_', ' ');
        this.status = changes.flow.currentValue.latestJob.status.replace('-', ' ');
        this.status = changes.flow.currentValue.latestJob.status.split(' ');
      }
    }
  }
  ngAfterContentChecked() {
    if (this.stepAdded) {
      if (this.steps.length !== 1) {
        this.selectedIndex += 1;
      }
      this.stepAdded = false;
    }
  }
  toggleBody() {
    this.showBody = !this.showBody;
  }
  dropped(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.stepsArray, event.previousIndex, event.currentIndex);
    moveItemInArray(this.flow.steps, event.previousIndex, event.currentIndex);
    this.selectedIndex = event.currentIndex;
    this.updateFlow.emit();
  }
  stepClicked(index: number): void {
    this.selectedIndex = index;
    this.stepSelected.emit(index);
  }
  newStepClicked(): void {
    let index = this.selectedIndex + 2;
    if (this.stepsArray.length === 0) {
      index = null;
    }
    console.log('index', index);
    this.newStep.emit(index);
  }
  runClicked(): void {
    this.runFlow.emit();
  }
  stopClicked(): void {
    this.stopFlow.emit(this.flow.id);
  }
  deleteStepClicked(step): void {
    this.deleteStep.emit(step);
  }
  editSettingsClicked(): void {
    this.editFlow.emit();
  }
  deleteFlowClicked(): void {
    this.deleteFlow.emit();
  }
  friendlyDate(dt): string {
    return (dt) ? moment(dt).fromNow() : '';
  }
  formatStatus(status):string {
    return _.capitalize(status.replace(/_/g,' ').replace(/-/g,' '));
  }
}
