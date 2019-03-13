import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Trace } from '../trace.model';
import { SearchResponse } from '../../search/search-response.model';

@Component({
  selector: 'app-traces-ui',
  templateUrl: './traces-ui.component.html',
  styleUrls: ['./traces-ui.component.scss']
})
export class TracesUiComponent {

  @Input() searchResponse: SearchResponse;
  @Input() traces: Array<Trace>;
  @Input() activeFacets: any;
  @Input() searchText: string;
  @Input() loadingTraces: boolean;
  @Output() searchClicked = new EventEmitter;
  @Output() activeFacetsChange = new EventEmitter;
  @Output() pageChanged = new EventEmitter;
  @Output() traceItemClicked = new EventEmitter;


  getIconClass(trace: Trace) {
    if (trace.flowType === 'harmonize') {
      return 'mdi-looks';
    } else if (trace.flowType === 'input') {
      return 'mdi-import';
    }
    return '';
  }

}
