import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SearchService } from './search.service';

import * as _ from 'lodash';

require('codemirror/mode/xquery/xquery');
require('codemirror/mode/javascript/javascript');

@Component({
  selector: 'app-search-viewer',
  template: `
    <app-search-viewer-ui
      [doc]="doc"
      [uri]="uri"
      [codeMirrorConfig]="codeMirrorConfig"
    ></app-search-viewer-ui>
  `,
})
export class SearchViewerComponent implements OnInit, OnDestroy {

  private sub: any;
  currentDatabase = 'STAGING';
  doc: string;
  uri: string;
  codeMirrorConfig = {
    lineNumbers: true,
    indentWithTabs: true,
    lineWrapping: true,
    readOnly: true,
    cursorBlinkRate: 0
  };

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
     this.uri = params['docUri'];
     this.currentDatabase = params['database'];
     this.searchService.getDoc(this.currentDatabase, this.uri).subscribe(doc => {
       this.doc = this.formatData(doc);
     });
   });
  }

  formatData(data: any) {
    if (_.isObject(data) || _.isArray(data)) {
      return JSON.stringify(data, null, '  ');
    }
    return data;
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
