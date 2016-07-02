import 'angular';
import 'angular-ui-router';
import 'ng-stomp/dist/ng-stomp.standalone.min';

import 'angular-moment';
import 'ngclipboard';

import {bootstrap} from 'ng-forward';
import {componentHooks} from 'ng-forward/cjs/decorators/component';
import App from './components/app/app';

componentHooks._beforeCtrlInvoke.push((caller, injects, controller, ddo, $injector, locals) => {
  locals.$element.addClass(locals.$element[0].tagName.toLowerCase() + '-component');
});

componentHooks._extendDDO.push((ddo) => {
  ddo.controllerAs = 'ctrl';
});

bootstrap(App, ['ui.router', 'angularMoment', 'ngStomp', 'ngclipboard']);
