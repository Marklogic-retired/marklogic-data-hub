import {Component, Input, Inject} from 'ng-forward';

import {TraceSearch} from '../trace-search/trace-search';
import template from './home.html';
import './home.scss';

@Component({
  selector: 'home',
  template,
  directives: [TraceSearch],
})
@Inject('$stateParams')
/**
 * @ngdoc directive
 * @name home
 * @restrict E
 *
 * @param message
 */
export class Home {
  constructor($stateParams) {
    this.q = $stateParams.q;
    this.p = $stateParams.p;
  }
}
