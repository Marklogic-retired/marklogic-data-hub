import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { SettingsService } from './settings.service';
import { InstallService } from '../installer';

import { ProjectService } from '../projects';

import { MdlDialogService } from '@angular-mdl/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent {

  installStatus: string;
  uninstallStatus: string;
  percentComplete: number;
  isInstalling: boolean = false;
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

  redeploy(): void {
    this.dialogService.confirm('Redeploy the hub config to MarkLogic?', 'Cancel', 'Redeploy').subscribe(() => {
      this.isInstalling = true;

      this.installStatus = '';
      let emitter = this.install.messageEmitter.subscribe((payload: any) => {
        this.percentComplete = payload.percentComplete;
        this.installStatus += '\n' + payload.message;
      });

      this.install.install().subscribe((env) => {
        setTimeout(() => {
          this.isInstalling = false;
          this.installStatus = null;
        }, 1000);
        emitter.unsubscribe();
      });
    },
    // cancel.. do nothing
    () => {});
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
