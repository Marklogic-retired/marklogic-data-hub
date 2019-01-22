import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/let';
import { Subscription } from 'rxjs/Subscription';
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
