import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';


@Component({
  selector: 'app-step',
  templateUrl: './step.component.html',
  styleUrls: ['./step.component.scss'],
})
export class StepComponent {
  @Input() step: any;
  constructor(

  ) {}



}
