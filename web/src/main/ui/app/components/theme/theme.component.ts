import {Component, ViewEncapsulation} from '@angular/core';

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
