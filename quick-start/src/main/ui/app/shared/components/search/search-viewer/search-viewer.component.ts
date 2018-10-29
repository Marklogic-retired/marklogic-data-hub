import { Component, OnInit, OnDestroy, ViewEncapsulation, Input} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SearchService } from '../../../../search/search.service';

import * as _ from 'lodash';

require('codemirror/mode/xquery/xquery');
require('codemirror/mode/javascript/javascript');

@Component({
  selector: 'app-search-viewer',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './search-viewer.component.html',
  styleUrls: [
    './search-viewer.component.scss'
  ],
})
export class SearchViewerComponent implements OnInit, OnDestroy {

  private sub: any;
  currentDatabase: string = 'STAGING';
  @Input() doc: string = null;
  @Input() uri: string;
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
     if (!!params['docUri']) {
      this.uri = params['docUri'];
     }
     if (!!params['database']) {
      this.currentDatabase = params['database'];
     }
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
