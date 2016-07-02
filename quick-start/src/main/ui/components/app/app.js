import {Component, Inject, StateConfig} from 'ng-forward';
import material from 'angular-material';

import template from './app.html';
import './app.scss';

import {Home} from '../home/home';
import {Login} from '../login/login';
import {NotFound} from '../errors/notfound';

import 'angular-material/angular-material.css';
import 'font-awesome/css/font-awesome.css';

import '../../config/config';

@Component({
  selector: 'app',
  providers: [
    material,
    'app.config',
  ],
  directives: [Home, Login, NotFound],
  template,
})
@StateConfig([
  { url: '/', component: Home, name: 'home' },
  { url: '/login', component: Login, name: 'login' },
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
    this.$rootScope = $rootScope;
    this.$rootScope.$on('$titleChange', (event, title) => {
      this.title = title;
    });
  }

  authenticated() {
    return this.$rootScope._authenticated || false;
  }

}
