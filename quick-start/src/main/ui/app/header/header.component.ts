import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { JobListenerService } from '../jobs/job-listener.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.tpl.html',
  providers: [],
  styleUrls: ['./header.style.scss'],
})
export class HeaderComponent {

  currentEnv: any;

  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private jobListener: JobListenerService,
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

  getTraceUrl(): string {
    if (this.currentEnv) {
      return '//' + this.currentEnv.mlSettings.host + ':' +
        this.currentEnv.mlSettings.tracePort + '/';
    }

    return '';
  }

  logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }

  isActive(url: string): boolean {
    return this.router.url === url;
  }
}
