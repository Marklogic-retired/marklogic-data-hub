import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { Flow } from '../entities/flow.model';

import { SelectKeyValuesComponent } from '../select-key-values/select-key-values.component';

@Component({
  selector: 'app-harmonize-flow-options',
  templateUrl: './harmonize-flow-options.component.html',
  styleUrls: ['./harmonize-flow-options.component.scss']
})
export class HarmonizeFlowOptionsComponent implements OnInit, OnChanges {

  @Input() flow: Flow;
  @Output() onChange = new EventEmitter<any>();
  @Output() onRun: EventEmitter<any> = new EventEmitter();;

  _isVisible: boolean = false;

  settings: any;
  keyVals: any;
  keyValTitle = 'Options';

  constructor() {}

  setDefaults() {
    this.settings = {
      batchSize: 100,
      threadCount: 4,
      options: {}
    };
    this.keyVals = [{
      key: '',
      val: ''
    }];
  }

  ngOnInit() {
    this.setDefaults();
    this.loadSettings(this.flow.flowName);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setDefaults();
    this.loadSettings(changes.flow.currentValue.flowName);
  }

  updateKayVals(newKeyVals) {
    this.keyVals = newKeyVals;
    this.saveSettings();
  }

  runHarmonize(): void {
    this.keyVals.forEach(function (kv) {
      if (kv.key !== '' && kv.val !== '') {
        this.settings.options[kv.key] = kv.val;
      }
    }, this);
    this.onRun.emit(this.settings);
  }

  loadSettings(flowName) {
    let localString = localStorage.getItem("flowSettings");
    if (localString) {
      let localObj = JSON.parse(localString);
      if (localObj[flowName]) {
        this.settings.batchSize = localObj[flowName].batchSize,
        this.settings.threadCount = localObj[flowName].threadCount,
        this.keyVals = localObj[flowName].keyVals;
      }
    }
  }

  saveSettings() {
    let localString = localStorage.getItem("flowSettings");
    let localObj = {};
    if (localString) {
      localObj = JSON.parse(localString);
    }
    localObj[this.flow.flowName] = {
      batchSize: this.settings.batchSize,
      threadCount: this.settings.threadCount,
      keyVals: this.keyVals
    }
    localStorage.setItem("flowSettings", JSON.stringify(localObj));
  }

  deleteSettings(flowName) {
    let localString = localStorage.getItem("flowSettings");
    let localObj = {};
    if (localString) {
      localObj = JSON.parse(localString);
      delete localObj[flowName];
    }
    localStorage.setItem("flowSettings", JSON.stringify(localObj));
  }

}
