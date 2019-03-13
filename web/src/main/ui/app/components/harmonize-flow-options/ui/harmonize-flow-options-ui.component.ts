import {Component, EventEmitter, Input, Output} from "@angular/core";
import { Flow } from '../../../models/flow.model';

@Component({
  selector: 'app-harmonize-flow-options-ui',
  templateUrl: './harmonize-flow-options-ui.component.html',
  styleUrls: ['./harmonize-flow-options-ui.component.scss'],
})
export class HarmonizeFlowOptionsUiComponent {
  @Input() flow: Flow;
  @Input() settings: any;
  @Input() keyVals: any;
  @Input() keyValTitle: string;
  @Input() validEntityCheck: boolean;

  @Output() keyValuesUpdate = new EventEmitter();
  @Output() saveSetting = new EventEmitter();
  @Output() harmonize = new EventEmitter();

  saveSettings() {
    this.saveSetting.emit();
  }

  updateKayVals(event) {
    this.keyValuesUpdate.emit(event);
  }

  runHarmonize() {
    this.harmonize.emit();
  }
}
