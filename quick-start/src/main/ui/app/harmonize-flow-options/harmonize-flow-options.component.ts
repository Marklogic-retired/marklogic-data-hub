import { Component, EventEmitter, HostBinding, OnInit } from '@angular/core';
import { Flow } from '../entities/flow.model';

@Component({
  selector: 'app-harmonize-flow-options',
  templateUrl: './harmonize-flow-options.component.html',
  styleUrls: ['./harmonize-flow-options.component.scss']
})
export class HarmonizeFlowOptionsComponent implements OnInit {

  @HostBinding('style.display') display: string = 'none';

  flow: Flow;

  finishedEvent: EventEmitter<any>;

  _isVisible: boolean = false;

  settings: any = {
    batchSize: 100,
    threadCount: 4
  };

  constructor() {}

  ngOnInit() {}

  show(flow: Flow): EventEmitter<boolean> {
    this.finishedEvent = new EventEmitter<boolean>(true);
    this.flow = flow;
    this.display = 'block';
    this._isVisible = true;
    return this.finishedEvent;
  }

  hide(): void {
    this.display = 'none';
    this._isVisible = false;
  }

  isVisible(): boolean {
    return this._isVisible;
  }

  cancel(): void {
    this.finishedEvent.error(false);
  }

  runHarmonize(): void {
    this.hide();
    this.finishedEvent.emit(this.settings);
  }
}
