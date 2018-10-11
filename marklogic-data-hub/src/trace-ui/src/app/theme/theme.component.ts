import {Component, ViewEncapsulation} from '@angular/core';

import 'mdi/css/materialdesignicons.css';
import 'material-design-icons-iconfont/dist/material-design-icons.css';
import 'font-awesome/css/font-awesome.css';
import 'codemirror/lib/codemirror.css';

@Component({
    selector: 'mlui-dhf-theme',
    template: `<ng-content></ng-content>`,
    styleUrls: [
       './theme.component.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class ThemeComponent {
}
