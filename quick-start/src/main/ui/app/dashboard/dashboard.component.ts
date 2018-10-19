import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { ProjectService } from '../shared/services/projects';

import { MdlDialogService } from '@angular-mdl/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // statsInterval: any;
  rows: any = [0, 1];

  databases: any = [
    'staging',
    'final',
    'job'
  ];

  stats: any;

  constructor(
    private ngZone: NgZone,
    private projectService: ProjectService,
    private dialogService: MdlDialogService,
    private router: Router
  ) {}

  getStatus() {
    this.projectService.getStatus().subscribe((stats) => {
      this.stats = stats;
    });
  }

  ngOnInit() {
    this.getStatus();
  }

  labelify(db) {
    if (db === "job") {
      return "jobs";
    } else {
      return db;
    }

  }
  getDbCount(db) {
    return this.stats[db + 'Count'];
  }

  clearDatabase(db) {
    const message = `Do you really want to remove all files from your ${this.labelify(db)} Database?`;
    this.dialogService.confirm(message, 'Cancel', 'Clear!').subscribe(() => {
      const database = this.stats[db + 'Db'];
      this.projectService.clearDatabase(database).subscribe(() => {
        this.getStatus();
      });
    },
    () => {});
  }

  clearAllDatabases() {
    const message = 'Do you really want to remove all files from all of your Data Hub Databases?';
    this.dialogService.confirm(message, 'Cancel', 'Clear!').subscribe(() => {
      this.projectService.clearAllDatabases().subscribe(() => {
        this.getStatus();
      });
    },
    () => {});
  }

}
