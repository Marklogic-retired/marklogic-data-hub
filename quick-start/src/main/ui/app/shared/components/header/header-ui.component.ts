import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-ui',
  templateUrl: './header-ui.component.html',
  styleUrls: ['./header-ui.component.scss'],
})
export class HeaderUiComponent {

  @Input() runningJobs: number;
  @Input() percentageComplete: number;
  @Input() activeCheck: Function;

  @Output() gotoJobs = new EventEmitter();
  @Output() logout = new EventEmitter();

  constructor(
    private router: Router
  ) {}
  logoutClicked() {
    this.logout.emit();
  }
  routeToJobs() {
    this.gotoJobs.emit();
  }
  isActive(url: string): boolean {
    if (url === '/') {
      return this.router.url === url;
    }

    return this.router.url.startsWith(url);
  }
}
