import { Component, Input, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { JobListenerService } from '../jobs/job-listener.service';
import { EnvironmentService } from '../environment';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  template: `
    <app-header-ui
      [runningJobs]="runningJobs"
      [percentageComplete]="percentageComplete"
      [routeToJobs]="routeToJobs"
      (logout)="logout()"
    ></app-header-ui>
  `
})
export class HeaderComponent implements OnInit {

  public runningJobs: Function;
  public percentageComplete: Function;
  public routeToJobs: Function;
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private envService: EnvironmentService,
    private router: Router
  ) {

  }
  ngOnInit() {
    this.runningJobs = this.getRunningJobCount.bind(this);
    this.percentageComplete = this.getPercentComplete.bind(this);
    this.routeToJobs = this.gotoJobs.bind(this);
  }

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
