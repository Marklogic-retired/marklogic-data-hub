import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TraceService } from './trace.service';
import { Trace } from './trace.model';
import { SearchResponse } from '../search';

import * as _ from 'lodash';

@Component({
  selector: 'app-traces',
  templateUrl: './traces.tpl.html',
  styleUrls: ['./traces.style.scss']
})
export class TracesComponent {

  searchText: string = '';
  currentPage: number = 1;
  pageLength: number = 10;
  loadingTraces: boolean = false;
  searchResponse: SearchResponse;
  traces: Array<Trace>;
  runningFlows: Map<number, string> = new Map<number, string>();

  constructor(
    private traceService: TraceService,
    private router: Router
  ) {
    this.getTraces();
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.getTraces();
  }

  getIconClass(trace: Trace) {
    if (trace.flowType === 'harmonize') {
      return 'mdi-looks';
    } else if (trace.flowType === 'input') {
      return 'mdi-import';
    }
    return '';
  }

  showTrace(traceId: string) {
    this.router.navigate(['/traces', traceId]);
  }

  private getTraces(): void {
    this.loadingTraces = true;
    this.traceService.getTraces(
      this.searchText, this.currentPage, this.pageLength
    ).subscribe(response => {
      this.searchResponse = response;
      this.traces = _.map(response.results, (result: any) => {
        return result.content;
      });
    },
    () => {},
    () => {
      this.loadingTraces = false;
    });
  }
}
