import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { JobListenerService } from '../jobs/job-listener.service';
import { FlowStatus } from '../entities/flow-status.model';

@Component({
  selector: 'header',
  templateUrl: './header.tpl.html',
  providers: [],
  styleUrls: ['./header.style.scss'],
})
export class Header {

  currentEnv: any;

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private router: Router
  ) {}

  private gotoJobs() {
    this.router.navigate(['jobs']);
  }

  private getRunningJobCount(): number {
    return this.jobListener.runningJobCount();
  }

  private getPercentComplete(): number {
    return this.jobListener.totalPercentComplete();
  }

  private getTraceUrl(): string {
    if (this.currentEnv) {
      return '//' + this.currentEnv.mlSettings.host + ':' +
        this.currentEnv.mlSettings.tracePort + '/';
    }

    return '';
  }

  private logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }

  private isActive(url: string): boolean {
    return this.router.url === url;
  }
}
