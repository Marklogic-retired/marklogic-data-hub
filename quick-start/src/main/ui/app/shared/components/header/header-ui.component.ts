import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { JobListenerService } from '../../../jobs/job-listener.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header-ui',
  templateUrl: './header-ui.component.html',
  styleUrls: ['./header-ui.component.scss'],
})
export class HeaderUiComponent {
  
  @Input() activeCheck: Function;

  @Output() logout = new EventEmitter();

  constructor(
    private jobListener: JobListenerService,
    private router: Router
  ) {}

  getRunningJobCount(): number {
    return this.jobListener.runningJobCount();
  }

  getPercentComplete(): number {
    return this.jobListener.totalPercentComplete();
  }

  logoutClicked() {
    this.logout.emit();
  }

  isActive(url: string): boolean {
    if (url === '/') {
      return this.router.url === url;
    }
    return this.router.url.startsWith(url);
  }

}
