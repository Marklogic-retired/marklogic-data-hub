import { Component, Input, OnInit } from '@angular/core';
import { Step } from '../../models/step.model';

@Component({
  selector: 'app-custom',
  template: `
  <app-custom-ui
    [step]="step"
    [module]="module"
  ></app-custom-ui>
`
})
export class CustomComponent implements OnInit {

  @Input() step: Step;
  @Input() module: string;
  constructor(

  ) { }

  ngOnInit() {

  }

}
