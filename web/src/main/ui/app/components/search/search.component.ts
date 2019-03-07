import { Component, OnChanges, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SearchService } from './search.service';
import { SearchResponse } from './index';

import { MdlSnackbarService } from '@angular-mdl/core';

import * as _ from 'lodash';

@Component({
  selector: 'app-search',
  template: `
    <app-search-ui
      [databases]="databases"
      [currentDatabase]="currentDatabase"
      [entitiesOnly]="entitiesOnly"
      [searchText]="searchText"
      [loadingTraces]="loadingTraces"
      [searchResponse]="searchResponse"
      [activeFacets]="activeFacets"
      (currentDatabaseChanged)="currentDatabaseChanged($event)"
      (entitiesOnlyChanged)="entitiesOnlyChanged($event)"
      (searchTextChanged)="searchTextChanged($event)"
      (pageChanged)="pageChanged($event)"
      (onActiveFacetsChange)="activeFacetsChange($event)"
      (doSearch)="doSearch()"
      (showDoc)="showDoc($event)"
      (uriCopied)="uriCopied()"
    ></app-search-ui>
  `
})
export class SearchComponent implements OnDestroy, OnInit {

  private sub: any;
  databases: Array<string> = ['STAGING', 'FINAL'];
  currentDatabase: string = 'STAGING';
  entitiesOnly: boolean = false;
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
    private router: Router,
    private snackbar: MdlSnackbarService,
  ) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
      this.searchText = params['q'];
      this.currentPage = params['p'] ? parseInt(params['p']) : this.currentPage;
      this.pageLength = params['pl'] || this.pageLength;
      this.currentDatabase = params['d'] || this.currentDatabase;
      this.entitiesOnly = params['e'] === 'true' || this.entitiesOnly;

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

  currentDatabaseChanged(db: string) {
    this.currentDatabase = db;
    this.doSearch();
  }

  entitiesOnlyChanged(val: boolean) {
    this.entitiesOnly = val;
    this.doSearch();
  }

  searchTextChanged(val: string) {
    this.searchText = val;
  }

  activeFacetsChange(facets: any) {
    this.activeFacets = facets;
    this.doSearch();
  }

  showDoc(doc: any) {
    this.router.navigate(['/view'], {
      queryParams: doc
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
    params['e'] = this.entitiesOnly;

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
      this.entitiesOnly,
      this.searchText,
      this.activeFacets,
      this.currentPage,
      this.pageLength
    ).subscribe(response => {
      this.searchResponse = response;
    },
    () => {},
    () => {
      this.loadingTraces = false;
    });
  }

  setDatabase(database) {
    this.currentDatabase = database;
  }

  uriCopied() {
    this.snackbar.showSnackbar({
      message: 'URI copied to the clipboard.'
    });
  }
}
