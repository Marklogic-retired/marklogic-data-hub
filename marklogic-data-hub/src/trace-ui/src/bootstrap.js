import 'angular';
import 'angular-ui-router';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/twilight.css';
import CodeMirror from 'codemirror';
window.CodeMirror = CodeMirror;

import 'codemirror/mode/xml/xml';
import 'codemirror/mode/javascript/javascript';

import 'angular-ui-codemirror';
import 'angular-moment';
import 'jsonformatter';
import 'jsonformatter/dist/json-formatter.min.css';

import {bootstrap} from 'ng-forward';
import {componentHooks} from 'ng-forward/cjs/decorators/component';
import App from './components/app/app';

componentHooks._beforeCtrlInvoke.push((caller, injects, controller, ddo, $injector, locals) => {
  locals.$element.addClass(locals.$element[0].tagName.toLowerCase() + '-component');
});

componentHooks._extendDDO.push((ddo) => {
  ddo.controllerAs = 'ctrl';
});

bootstrap(App, ['ui.router', 'ui.codemirror', 'angularMoment', 'jsonFormatter']);
