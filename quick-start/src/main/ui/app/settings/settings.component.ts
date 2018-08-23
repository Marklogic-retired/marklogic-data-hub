import { Component, NgZone } from '@angular/core';
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
  isMlcpPathValid: boolean = false;

  constructor(
    private settings: SettingsService,
    private install: InstallService,
    private projectService: ProjectService,
    private dialogService: MdlDialogService,
    private router: Router,
    private ngZone: NgZone
  ) {
    this.mlcpPath = settings.mlcpPath;
  }

  get mlcpPath() {
    return this.settings.mlcpPath;
  }

  set mlcpPath(path: string) {
    if (path && path.length > 0) {
      this.settings.validateMlcpPath(path).subscribe((resp: any) => {
        this.isMlcpPathValid = resp.valid;
        if (resp.valid) {
          this.settings.mlcpPath = path;
        }
      });
    } else {
      this.settings.mlcpPath = path;
    }
  }

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
        this.ngZone.run(() => {
          this.isInstalling = false;
          this.installStatus = null;
          emitter.unsubscribe();
        });
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

  uninstallAll(): void {
    this.dialogService.confirm('Uninstall the hub AND associated final apps from MarkLogic?', 'Cancel', 'Uninstall').subscribe(() => {
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
        this.install.uninstallAll();
      },
      // cancel.. do nothing
      () => {});
  }
}
