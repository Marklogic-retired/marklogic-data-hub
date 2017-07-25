import {
  Component,
  EventEmitter,
  HostBinding,
  Input,
  OnInit,
  Output
} from '@angular/core';
import { Flow } from '../entities/flow.model';

@Component({
  selector: 'app-harmonize-flow-options',
  templateUrl: './harmonize-flow-options.component.html',
  styleUrls: ['./harmonize-flow-options.component.scss']
})
export class HarmonizeFlowOptionsComponent implements OnInit {

  @Input() flow: Flow;

  @Output() onRun: EventEmitter<any> = new EventEmitter();;

  _isVisible: boolean = false;

  settings: any = {
    batchSize: 100,
    threadCount: 4
  };

  constructor() {}

  ngOnInit() {}

  runHarmonize(): void {
    this.onRun.emit(this.settings);
  }
}
