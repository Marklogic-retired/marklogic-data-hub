import {Component, Inject, StateConfig} from 'ng-forward';
import angularTouch from 'angular-touch';
import material from 'angular-material';

import template from './app.html';
import './app.scss';

import {Home} from '../home/home';
import {Trace} from '../trace/trace';
import {NotFound} from '../errors/notfound';

import 'angular-material/angular-material.css';
import 'font-awesome/css/font-awesome.css';

import '../../config/config';

@Component({
  selector: 'app',
  providers: [
    material,
    angularTouch,
    'app.config',
  ],
  directives: [Home, Trace, NotFound],
  template,
})
@StateConfig([
  { url: '/?p&q', component: Home, name: 'home', params: { p: { squash: true }, q: { squash: true } } },
  { url: '/trace/:id', component: Trace, name: 'trace' },
  { url: '/404', component: NotFound, name: 'notfound' },
])
@Inject('$rootScope')
/**
 * @ngdoc directive
 * @name app
 * @restrict E
 */
export default class App {
  constructor($rootScope) {
    $rootScope.$on('$titleChange', (event, title) => {
      this.title = title;
    });
  }
}
