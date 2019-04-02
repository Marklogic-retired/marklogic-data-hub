import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, AfterContentChecked } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


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
  @Output() deleteStep = new EventEmitter();
  @Output() editFlow = new EventEmitter();
  @Output() deleteFlow = new EventEmitter();
  @Output() updateFlow = new EventEmitter();

  showBody = true;
  stepAdded = false;

  ngOnChanges(changes: SimpleChanges) {
    if ( changes.hasOwnProperty('flow') && !changes.flow.firstChange && changes.flow.currentValue.steps.length > changes.flow.previousValue.steps.length ) {
      this.stepAdded = true;
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
  }
  newStepClicked(): void {
    console.log('selected INdex', this.selectedIndex);
    this.newStep.emit(this.selectedIndex + 1);
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
}
