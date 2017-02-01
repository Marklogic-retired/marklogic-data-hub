import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsService } from './settings.service';
import { InstallService } from '../installer';

import { ProjectService } from '../projects';

import { MdlDialogService } from 'angular2-mdl';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.tpl.html',
  styleUrls: ['./settings.style.scss'],
})
export class SettingsComponent {

  uninstallStatus: string;
  percentComplete: number;
  isUninstalling: boolean = false;

  constructor(
    private settings: SettingsService,
    private install: InstallService,
    private projectService: ProjectService,
    private dialogService: MdlDialogService,
    private router: Router
  ) {}

  debugEnabled() {
    return this.settings.debugEnabled;
  }

  toggleDebug(checked: boolean): void {
    if (checked !== this.settings.debugEnabled) {
      this.settings.toggleDebugging();
    }
  }

  traceEnabled(): boolean {
    return this.settings.traceEnabled;
  }

  toggleTrace(checked: boolean): void {
    if (checked !== this.settings.traceEnabled) {
      this.settings.toggleTracing();
    }
  }

  uninstall(): void {
    this.dialogService.confirm('Uninstall the hub from MarkLogic?', 'Cancel', 'Uninstall').subscribe(() => {
    this.uninstallStatus = '';
    this.isUninstalling = true;
    let emitter = this.install.messageEmitter.subscribe((payload: any) => {
      this.percentComplete = payload.percentComplete;
      this.uninstallStatus += '\n' + payload.message;

      if (this.percentComplete === 100) {
        emitter.unsubscribe();
        setTimeout(() => {
          this.router.navigate(['login']);
        }, 1000);
      }
    });
    this.install.uninstall();
    },
    // cancel.. do nothing
    () => {});
  }
}
