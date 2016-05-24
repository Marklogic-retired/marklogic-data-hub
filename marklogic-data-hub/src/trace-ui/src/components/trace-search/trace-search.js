import {Component, Input, Inject} from 'ng-forward';
import {TraceService} from '../../services/traceService';
import {Pagination} from '../pagination/pagination';

import template from './trace-search.html';
import './trace-search.scss';

@Component({
  selector: 'trace-search',
  template,
  providers: [TraceService],
  directives: [Pagination],
  inputs: ['query', 'page'],
})
@Inject('$scope', '$state', TraceService)
/**
 * @ngdoc directive
 * @name trace-search
 * @restrict E
 *
 * @param message
 */
export class TraceSearch {
  constructor($scope, $state, traceService) {
    this.$state = $state;
    this.traceService = traceService;
    $scope.$watch('ctrl.page', () => this.search());
  }

  getMatches(query) {
    return this.traceService.getIds(query).then(resp => {
      return resp.data;
    });
  }

  itemSelected(selected) {
    this.$state.go('trace', { id: selected.traceId });
  }

  search() {
    const q = this.query || '*';
    const p = this.page || 1;
    return this.traceService.search(q, p).then(resp => {
      this.searchResponse = resp.data;
    });
  }

  runSearch() {
    this.$state.go('home', {q: this.query, p: 1});
  }

  pageChanged(event) {
    this.page = event.detail;
    this.$state.go('home', {q: this.query, p: this.page});
  }
}
