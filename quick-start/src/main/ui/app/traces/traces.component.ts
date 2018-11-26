import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TraceService } from './trace.service';
import { Trace } from './trace.model';
import { SearchResponse } from '../search';

import * as _ from 'lodash';

@Component({
  selector: 'app-traces',
  template: `
    <app-traces-ui
      [searchResponse]="searchResponse"
      [traces]="traces"
      [activeFacets]="activeFacets"
      [searchText]="searchText"
      [loadingTraces]="loadingTraces"
      (searchClicked)="doSearch($event)"
      (activeFacetsChange)="updateFacets($event)"
      (traceItemClicked)="showTrace($event)"
      (pageChanged)="pageChanged($event)"
    ></app-traces-ui>
  `,
})
export class TracesComponent implements OnDestroy, OnInit {

  private sub: any;
  searchText: string = null;
  activeFacets: any = {};
  currentPage: number = 1;
  pageLength: number = 10;
  loadingTraces: boolean = false;
  searchResponse: SearchResponse;
  traces: Array<Trace>;
  runningFlows: Map<number, string> = new Map<number, string>();
  facetNames: Array<string> = ['entityName', 'status', 'flowName', 'flowType', 'jobId'];

  constructor(
    private traceService: TraceService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.searchText = params['q'];
      this.currentPage = params['p'] ? parseInt(params['p']) : this.currentPage;
      this.pageLength = params['pl'] || this.pageLength;

      for (let facet of this.facetNames) {
        if (params[facet]) {
          this.activeFacets[facet] = {
            values: [params[facet]]
          };
        }
      }
      this.getTraces();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.runQuery();
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
    if (traceId) {
      this.router.navigate(['/traces', traceId]);
    }
  }

  public doSearch(searchText: string): void {
    this.searchText = searchText;
    this.currentPage = 1;
    this.runQuery();
  }

  private runQuery(): void {
    let params = {
      p: this.currentPage
    };
    if (this.searchText) {
      params['q'] = this.searchText;
    }

    Object.keys(this.activeFacets).forEach((key) => {
      if (this.activeFacets[key] && this.activeFacets[key].values && this.activeFacets[key].values.length > 0) {
        params[key] = this.activeFacets[key].values[0];
      }
    });

    this.router.navigate(['/traces'], {
      queryParams: params
    });
  }

  private getTraces(): void {
    this.loadingTraces = true;
    this.traceService.getTraces(
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
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

  updateFacets(facets) {
    this.activeFacets = facets;
    this.doSearch(this.searchText);
  }
}
