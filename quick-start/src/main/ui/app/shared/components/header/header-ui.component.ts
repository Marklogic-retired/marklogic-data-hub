import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-header-ui',
  templateUrl: './header-ui.component.html',
  styleUrls: ['./header-ui.component.scss'],
})
export class HeaderUiComponent {

  @Input() runningJobs: Function;
  @Input() percentageComplete: Function;
  @Input() routeToJobs: Function;
  @Output() logout = new EventEmitter();

  constructor(
  ) {}

  logoutClicked() {
    this.logout.emit();
  }
}
