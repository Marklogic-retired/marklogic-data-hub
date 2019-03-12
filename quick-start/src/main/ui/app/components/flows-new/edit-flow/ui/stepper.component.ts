import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: StepperComponent }]
})
export class StepperComponent extends CdkStepper  {

  @Input() flow: any;
  @Input() stepsArray: any;
  @Output() newStep = new EventEmitter();
  @Output() run = new EventEmitter();
  @Output() deleteStep = new EventEmitter();
  @Output() editFlow = new EventEmitter();
  @Output() redeploy = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();
  @Output() updateFlow = new EventEmitter();

  showBody = true;

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
  }
  newStepClicked(): void {
    this.newStep.emit();
  }
  runClicked(): void {
    this.run.emit();
  }
  stopClicked(): void {
    console.log('stop clicked');
  }
  deleteStepClicked(step): void {
    this.deleteStep.emit(step);
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
