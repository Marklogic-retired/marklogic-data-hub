import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';

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
    private router: Router
  ) {
    projectService.currentProject().subscribe(env => {
      this.currentEnv = env;
    });
  }

  getTraceUrl() {
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
