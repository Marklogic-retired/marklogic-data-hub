import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Step} from '../../../models/step.model';

@Component({
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss'],
})
export class CustomUiComponent {
  @Input() step: Step;
  @Input() module: string;
  @Output() updateCustom = new EventEmitter();

  constructor() {
  }

  onChange() {
    this.updateCustom.emit(this.step);
  }
}
