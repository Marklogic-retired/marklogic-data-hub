import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable ,  Subscription } from 'rxjs';
import { AuthService } from '../../services/auth';
import { ProjectService } from '../../services/projects';
import { JobListenerService } from '../jobs';
import { EnvironmentService } from '../../services/environment';

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
export class HeaderComponent implements OnInit {
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
    private envService: EnvironmentService,
    private router: Router
  ) { }

  public runningJobs = 0;
  public percentageComplete = 0;

  ngOnInit() {
    this.jobListener.runningJobCount().subscribe(runningJobs => {
      this.runningJobs = runningJobs;
    });
    this.jobListener.totalPercentComplete().subscribe(percentage => {
      this.percentageComplete = percentage;
    });
  }
  logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }
}
