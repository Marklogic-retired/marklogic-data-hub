import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TimeAgoPipe } from 'angular2-moment';
import { TraceService } from './trace.service';
import { Trace } from './trace.model';
import { SearchResponse } from '../search/index';
import { Pagination } from '../pagination/index';

import * as moment from 'moment';

import * as _ from 'lodash';

@Component({
  selector: 'traces',
  templateUrl: './traces.tpl.html',
  directives: [Pagination],
  pipes: [TimeAgoPipe],
  providers: [TraceService],
  styleUrls: ['./traces.style.css'],
})
export class Traces {

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

  private pageChanged(page: number) {
    this.currentPage = page;
    this.getTraces();
  }

  private getIconClass(trace: Trace) {
    if (trace.flowType === 'harmonize') {
      return 'mdi-looks';
    } else if (trace.flowType === 'input') {
      return 'mdi-import';
    }
    return '';
  }

  private showTrace(traceId: string) {
    this.router.navigate(['/traces', traceId]);
  }
}
