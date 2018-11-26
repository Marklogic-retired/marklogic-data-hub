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
    [runningJobs]="runningJobs"
    [percentageComplete]="percentageComplete"
    (logout)="this.logout()"
  ></app-header-ui>
`
})
export class HeaderComponent {
  runningJobs: number = 0;
  percentageComplete: number = null;
  
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private envService: EnvironmentService,
    private router: Router
  ) { }

  ngOnChange() {
    this.runningJobs = this.getRunningJobCount();
    this.percentageComplete = this.getPercentComplete();
  }

  getRunningJobCount(): number {
    return this.jobListener.runningJobCount();
  }

  getPercentComplete(): number {
    return this.jobListener.totalPercentComplete();
  }

  logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }
}
