import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';

import * as _ from 'lodash';

@Component({
  selector: 'pagination',
  templateUrl: './pagination.tpl.html',
  directives: [],
  styleUrls: ['./pagination.style.scss'],
})
export class Pagination implements OnInit, OnChanges {
  @Input() start: number;
  @Input() pageLength: number;
  @Input() total: number;
  end: number;
  currentPage: number;
  totalPages: number;

  pages: Array<any>;

  @Output() pageChanged = new EventEmitter();

  constructor() {
  }

  ngOnInit() {
    this.calculatePaging();
  }

  ngOnChanges(changes) {
    if (changes.start || changes.pageLength) {
      this.calculatePaging();
    }
  }

  calculatePaging() {
    let s;
    let e;
    let i;
    if (this.start && this.pageLength) {
      this.end = Math.min(this.start + this.pageLength - 1, this.total);
      this.currentPage = (this.start - 1) / this.pageLength + 1;
      this.totalPages = Math.floor(this.total / this.pageLength);
      s = this.currentPage - 4;
      s = (s < 1) ? 1 : s;
      e = s + 8;
      if (e > this.totalPages) {
        const diff = e - this.totalPages;
        e -= diff;
        s -= diff;
      }
      s = (s < 1) ? 1 : s;
      this.pages = [];
      for (i = s; i <= e; i++) {
        this.pages.push(i);
      }
    }
  }

  gotoPage(page) {
    if (page >= 1 && page <= this.totalPages) {
      this.pageChanged.next(page);
    }
  }
}
