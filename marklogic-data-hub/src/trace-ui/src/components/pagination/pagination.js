import {Component, Input, Output, Inject, EventEmitter} from 'ng-forward';

import template from './pagination.html';
import './pagination.scss';

@Component({
  selector: 'pagination',
  template,
  inputs: ['start', 'end', 'total', 'pageCount'],
})
@Inject('$scope')
/**
 * @ngdoc directive
 * @name pagination
 * @restrict E
 *
 */
export class Pagination {
  @Output() pageChanged = new EventEmitter();

  constructor($scope) {
    $scope.$watch('ctrl.start', () => this.calculatePaging());
    $scope.$watch('ctrl.pageCount', () => this.calculatePaging());
  }

  calculatePaging() {
    let s;
    let e;
    let i;
    if (this.start && this.pageCount) {
      this.page = (this.start - 1) / this.pageCount + 1;
      this.totalPages = Math.floor(this.total / this.pageCount);
      s = this.page - 4;
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
