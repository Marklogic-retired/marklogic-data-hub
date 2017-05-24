import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from './search.service';
import { SearchResponse } from '../search';

import * as _ from 'lodash';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnDestroy, OnInit {

  private sub: any;
  databases: Array<string> = ['STAGING', 'FINAL'];
  currentDatabase: string = 'STAGING';
  searchText: string = null;
  activeFacets: any = {};
  currentPage: number = 1;
  pageLength: number = 10;
  loadingTraces: boolean = false;
  searchResponse: SearchResponse;
  runningFlows: Map<number, string> = new Map<number, string>();

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.searchText = params['q'];
      this.currentPage = params['p'] ? parseInt(params['p']) : this.currentPage;
      this.pageLength = params['pl'] || this.pageLength;
      this.currentDatabase = params['d'] || this.currentDatabase;

      for (let facet of Object.keys(params)) {
        if (!_.includes(['q', 'p', 'pl', 'd', 'e'], facet) && params[facet]) {
          this.activeFacets[facet] = {
            values: [params[facet]]
          };
        }
      }
      this.getResults();
    });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }

  pageChanged(page: number) {
    this.currentPage = page;
    this.runQuery();
  }

  showDoc(database: string, docUri: string) {
    this.router.navigate(['/view'], {
      queryParams: {
        database: database,
        docUri: docUri
      }
    });
  }

  doSearch(): void {
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
    params['d'] = this.currentDatabase;

    Object.keys(this.activeFacets).forEach((key) => {
      if (this.activeFacets[key] && this.activeFacets[key].values && this.activeFacets[key].values.length > 0) {
        params[key] = this.activeFacets[key].values[0];
      }
    });

    this.router.navigate(['/browse'], {
      queryParams: params
    }).then((result: boolean) => {
      if (result !== true) {
        this.getResults();
      }
    });
  }

  private getResults(): void {
    this.loadingTraces = true;
    this.searchService.getResults(
      this.currentDatabase,
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.searchResponse = response;
      // this.traces = _.map(response.results, (result: any) => {
      //   return result.content;
      // });
    },
    () => {},
    () => {
      this.loadingTraces = false;
    });
  }

  updateFacets() {
    this.doSearch();
  }

  setDatabase(database) {
    this.currentDatabase = database;
  }
}
