import { Component } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';

@Component({
  selector: 'header',
  templateUrl: './header.tpl.html',
  providers: [ProjectService],
  styleUrls: ['./header.style.scss'],
})
export class Header {
  constructor(
    private projectService: ProjectService,
    private auth: AuthService,
    private router: Router) {}

  logout() {
    this.projectService.logout().subscribe(() => {
      this.auth.setAuthenticated(false);
      this.router.navigate(['login']);
    });
  }
}
