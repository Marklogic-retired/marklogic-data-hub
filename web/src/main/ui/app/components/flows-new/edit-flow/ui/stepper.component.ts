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

  addStep(): void {
    const newStep = {
      id: 'new-step',
      name: 'New Step',
      description: 'New Step description',
      type: 'ingestion',
      sourceDatabase: '',
      targetDatabase: 'staging',
      isValid: true,
      isRunning: false,
      config: {
        mlcp: 'options'
      },
      language: 'en',
      version: '1'
    };
    this.flow.steps.push(newStep);
  }
  deleteStep() {
    this.flow.steps.splice(this.selectedIndex, 1);
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
}
