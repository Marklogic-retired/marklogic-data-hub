import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Step} from '../../models/step.model';

@Component({
  selector: 'app-custom',
  template: `
    <app-custom-ui
      [step]="step"
      [module]="module"
      (updateCustom)="saveStep.emit($event)"
    ></app-custom-ui>
  `
})
export class CustomComponent {

  @Input() step: Step;
  @Input() module: string;
  @Output() saveStep = new EventEmitter();

  constructor() {
  }

}
