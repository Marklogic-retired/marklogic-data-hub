import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { SearchService } from './search.service';

import * as _ from 'lodash';

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
  doc: string = null;

  constructor(
    private route: ActivatedRoute,
    private searchService: SearchService
  ) {}

  ngOnInit() {
    this.sub = this.route.queryParams.subscribe(params => {
     let docUri = params['docUri'];
     this.currentDatabase = params['database'];
     this.searchService.getDoc(this.currentDatabase, docUri).subscribe(doc => {
       this.doc = doc.doc;
     });
   });
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
