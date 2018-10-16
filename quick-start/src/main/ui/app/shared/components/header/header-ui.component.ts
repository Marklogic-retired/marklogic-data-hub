import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-ui',
  templateUrl: './header-ui.component.html',
  styleUrls: ['./header-ui.component.scss'],
})
export class HeaderUiComponent {

  @Input() runningJobs: number;
  @Input() percentageComplete: number;
  // @Input() isLoading: boolean = false;
  // @Input() folders: any[] = null;
  // @Input() files: any[] = null;
  //@Output() runningJobCount = new EventEmitter();
  @Output() logout = new EventEmitter();
  //@Output() active = new EventEmitter();

  constructor(
    private router: Router
  ) {}

  gotoJobs() {
    this.router.navigate(['jobs']);
  }
  isActive(url: string): boolean {
    if (this.router.url.startsWith(url)) {
      return this.router.url === url;
    }

    return this.router.url.startsWith(url);
  }

  logoutClicked() {
    this.logout.emit();
  }
}
