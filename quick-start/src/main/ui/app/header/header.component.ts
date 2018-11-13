import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects';
import { JobListenerService } from '../jobs/job-listener.service';
import { EnvironmentService } from '../environment';

@Component({
  selector: 'app-header',
  template: `
  <app-header-ui
    [runningJobs]="this.getRunningJobCount()"
    [percentageComplete]="this.getPercentComplete()"
    (gotoJobs)="this.gotoJobs()"
    (logout)="this.logout()"
  ></app-header-ui>
`
})
export class HeaderComponent {

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private envService: EnvironmentService,
    private router: Router
  ) {}

  gotoJobs() {
    this.router.navigate(['jobs']);
  }

  getRunningJobCount(): number {
    return this.jobListener.runningJobCount();
  }

  getPercentComplete(): number {
    return this.jobListener.totalPercentComplete();
  }

  getMarkLogicVersion(): number {
    let version = this.envService.marklogicVersion.substr(0, this.envService.marklogicVersion.indexOf('.'));
    return parseInt(version);
  }

  logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }
}
