import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Step } from '../../../models/step.model';
import * as _ from 'lodash';

@Component({
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss'],
})
export class CustomUiComponent {
  @Input() step: Step;
  @Input() module: string;
  @Output() updateCustom = new EventEmitter();

  private uriOrig: string = '';

  constructor(

  ) {}
  onSave() {
    console.log(this.step.customModuleUri, this.uriOrig);
    this.uriOrig = _.cloneDeep(this.step.customModuleUri);
    this.updateCustom.emit(this.step);
  }
  uriChanged() {
    return !_.isEqual(this.step.customModuleUri, this.uriOrig);
  }
}
