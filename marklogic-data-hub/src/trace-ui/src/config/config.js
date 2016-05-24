import angular from 'angular';
import 'angular-material';
export default angular.module('app.config', []) // eslint-disable-line
.config(Config);

Config.$inject = [
  '$mdThemingProvider',
  '$mdIconProvider',
  '$locationProvider',
  '$urlRouterProvider',
];

function Config($mdThemingProvider, $mdIconProvider, $locationProvider, $urlRouterProvider) {
  $mdThemingProvider
    .theme('default')
    .primaryPalette('brown')
    .accentPalette('amber')
    .warnPalette('red')
    .backgroundPalette('grey');

  $mdIconProvider.fontSet('md', 'material-icons');

  $locationProvider.html5Mode({ enabled: true, requireBase: false });

  $urlRouterProvider.otherwise('/404');
}
