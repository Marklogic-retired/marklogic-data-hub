import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper {

  @Input() flow: any;
  @Output() newStep = new EventEmitter();
  @Output() run = new EventEmitter();
  @Output() delete = new EventEmitter();
  @Output() editFlow = new EventEmitter();
  @Output() redeploy = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();

  showBody = true;
  toggleBody() {
    this.showBody = !this.showBody;
  }
  dropped(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.flow.steps, event.previousIndex, event.currentIndex);
    this.selectedIndex = event.currentIndex;
  }
  stepClicked(index: number): void {
    this.selectedIndex = index;
    // this.stepIndex = index;
  }
  newStepClicked(): void {
    this.newStep.emit();
  }
  runClicked(): void {
    this.run.emit();
  }
  deleteStepClicked(step): void {
    this.delete.emit(step);
  }
  editSettingsClicked(): void {
    this.editFlow.emit();
  }
  redeployClicked(): void {
    this.redeploy.emit();
  }
  deleteFlowClicked(): void {
    this.deleteFlow.emit();
  }
}
