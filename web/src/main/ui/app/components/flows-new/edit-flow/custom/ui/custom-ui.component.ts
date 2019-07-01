import {Component, EventEmitter, Input, Output, OnInit} from '@angular/core';
import {Step} from '../../../models/step.model';
import {FlowsTooltips} from "../../../tooltips/flows.tooltips";

@Component({
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss'],
})
export class CustomUiComponent {
  @Input() step: Step;
  @Input() module: string;
  @Output() updateCustom = new EventEmitter();
  tooltips: any;

  constructor() {
  }

  ngOnInit(){
    this.tooltips = FlowsTooltips.custom;
  }

  onChange() {
    this.updateCustom.emit(this.step);
  }
}
