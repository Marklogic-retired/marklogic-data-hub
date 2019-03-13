import { Component, Input, OnChanges, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-pagination',
  templateUrl: './pagination.component.html',
  styleUrls: ['./pagination.component.scss'],
})
export class PaginationComponent implements OnInit, OnChanges {
  @Input() start: number;
  @Input() pageLength: number;
  @Input() total: number;
  end: number;
  currentPage: number;
  totalPages: number;

  pages: Array<any>;

  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit() {
    this.calculatePaging();
  }

  ngOnChanges(changes: any) {
    if (changes.total || changes.pageLength) {
      this.calculatePaging();
    }
  }

  calculatePaging(): void {
    let s: number;
    let e: number;
    let i: number;
    if (this.start && this.pageLength) {
      this.end = Math.min(this.start + this.pageLength - 1, this.total);
      this.currentPage = (this.start - 1) / this.pageLength + 1;
      this.totalPages = Math.ceil(this.total / this.pageLength);
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

  gotoPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.start = (this.currentPage - 1) * this.pageLength + 1;
      this.calculatePaging();
      this.pageChanged.next(page);
    }
  }
}
