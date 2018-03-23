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
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Flow } from '../entities/flow.model';
import { EntitiesService } from '../entities/entities.service';
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

  static readonly newLabel: string = 'New...';

  _isVisible: boolean = false;

  settings: any;
  mapName: string = null;
  keyVals: any;
  keyValTitle = 'Options';

  constructor(
    private router: Router,
    private entitiesService: EntitiesService
  ) {}

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
    this.loadMap(this.flow.flowName);
    this.loadSettings(this.flow.flowName);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setDefaults();
    this.loadMap(changes.flow.currentValue.flowName);
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

  loadMap(flowName) {
    let localString = localStorage.getItem("mapping");
    if (localString) {
      let localObj = JSON.parse(localString);
      if (localObj[this.flow.entityName]) {
        if (localObj[this.flow.entityName][flowName]) {
          this.mapName = localObj[this.flow.entityName][flowName].name;
        }
      }
    }
  }

  deleteMap() {
    console.log('deleteMap');
    let localString = localStorage.getItem("mapping");
    let localObj = {};
    if (localString) {
      let localObj = JSON.parse(localString);
      if (localObj[this.flow.entityName]) {
        if (localObj[this.flow.entityName][this.flow.flowName]) {
          delete localObj[this.flow.entityName][this.flow.flowName];
          this.mapName = null;
        }
      }
    }
    localStorage.setItem("mapping", JSON.stringify(localObj));
  }

  loadSettings(flowName) {
    let localString = localStorage.getItem("flowSettings");
    if (localString) {
      let localObj = JSON.parse(localString);
      if (localObj[flowName]) {
        this.settings.batchSize = localObj[flowName].batchSize,
        this.settings.threadCount = localObj[flowName].threadCount,
        this.settings.map = localObj[flowName].map,
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
      map: this.settings.map,
      keyVals: this.keyVals
    }
    localStorage.setItem("flowSettings", JSON.stringify(localObj));
    // save to file
    this.keyVals.forEach(function (kv) {
      if (kv.key !== '' && kv.val !== '') {
        this.settings.options[kv.key] = kv.val;
      }
    }, this);
    this.entitiesService.saveHarmonizeFlowOptions(this.flow, this.settings.batchSize, this.settings.threadCount, {foo: "bar"}, this.settings.options);
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
