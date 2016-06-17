//import {expect, sinon} from '../tests/frameworks';
import 'angular';
import 'angular-mocks';
import {providers, TestComponentBuilder} from 'ng-forward/dist/tests';

import App from '../../../src/components/app/app';

describe('Component: app', () => {
    let tcl;
    let component;

    describe('class definition', () => {
        // new App();
    });

    beforeEach(() => {
        providers(provide => {
            return [
                provide('Filters', { useValue: ['a', 'b', 'c']}),
            ];
        });

        tcl = new TestComponentBuilder();
        component = tcl.create(App);

        // @todo: not getting the 'full' set of stuff from TCB/RTC.
        console.log(component); // eslint-disable-line no-console
    });

    // @todo: access the instance, check up 'selector === filterLinks'
    it('has a selector of "filterLinks"', () => {
    });
});
