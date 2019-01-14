import {Component, NgZone, OnInit, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects';
import { InstallService } from '../installer';
import { LoginInfo } from './login-info.model';
import { HubSettings } from '../environment/hub-settings.model';
import { MdlDialogService } from '@angular-mdl/core';
import {LoginUIComponent} from "../shared/components";

import * as SemVer from 'semver';

@Component({
  selector: 'app-login',
  template: `
    <app-login-ui
      [currentEnvironment]="this.currentEnvironment"
      [installationStatus]="this.installationStatus"
      [installing]="this.installing"
      [percentComplete]="this.percentComplete"
      [uninstalling]="this.uninstalling"
      [showInitAdvanced]="this.showInitAdvanced"
      [showFolderBrowser]="this.showFolderBrowser"
      [projects]="this.projects"
      [currentProject]="this.currentProject"
      [lastProject]="this.lastProject"
      [loggingIn]="this.loggingIn"
      [loginError]="this.loginError"
      [loginInfo]="this.loginInfo"
      [initSettings]="this.initSettings"
      [hubUpdateFailed]="this.hubUpdateFailed"
      [hubUpdating]="this.hubUpdating"
      
      (onInstall)="this.install()"
      (onUninstall)="this.unInstall()"
      (onInstallNext)="this.installNext()"
      (onChooseProject)="this.chooseProject()"
      (onPostInitNext)="this.postInitNext()"
      (onLogin)="this.login()"
      (onHubNameChanged)="this.hubNameChanged()"
      (onGotEnvironment)="this.gotEnvironment($event)"
      (onHubUpdateUrl)="this.hubUpdateUrl()"
      (onUpdateProject)="this.updateProject()"
      (onProjectSelected)="this.project = $event"
      (onRemoveProject)="this.removeProject($event)"
      (onInitProject)="this.initProject()"
      (onRestoreInitDefaults)="this.restoreInitDefaults()"
      (onShowFolderBrowser)="this.showFolderBrowser = $event"
    >
      <app-folder-browser class="app-folder-browser"
        start-path='.'
        absoluteOnly="true"
        (folderChosen)="folderClicked($event)">
      </app-folder-browser>
    </app-login-ui>
  `
})

export class LoginComponent implements OnInit {

  @ViewChild(LoginUIComponent)
  private loginUi: LoginUIComponent;

  defaultSettings: HubSettings;
  initSettings: HubSettings = new HubSettings();
  showInitAdvanced: boolean = false;

  hubVersions: any;
  hubUpdating: boolean = false;
  hubUpdateFailed: boolean = false;
  hubUpdateError: string = '';

  loginError: string = null;
  loggingIn: boolean = false;

  appServers: Array<string> = [
    'staging',
    'final',
    'job',
    'trace'
  ];

  installing: boolean = false;
  uninstalling: boolean = false;

  environments = ['local', 'dev', 'qa', 'prod'];

  showFolderBrowser = false;

  installationStatus: string = null;

  projects: Array<any>;

  lastProject: any;

  percentComplete: number;

  folder: string;

  project: string;

  currentProject: any = null;

  currentEnvironment: any;

  currentEnvironmentString: string;

  runningPreinstallCheck: boolean = false;
  preinstallCheck: any;

  loginInfo: LoginInfo = new LoginInfo();

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private installService: InstallService,
    private dialogService: MdlDialogService,
    private router: Router,
    private ngZone: NgZone) {
  }

  ngOnInit() {
    this.projectService.getProjects().subscribe((resp) => {
      this.projects = resp.projects;

      if (this.projects.length > 0) {
        if (resp.lastProject) {
          _.each(this.projects, project => {
            if (project.id === resp.lastProject) {
              this.lastProject = project;
            }
          });
        }
      } else {
        this.showFolderBrowser = true;
      }
    });
  }

  install() {
    this.installing = true;

    this.installationStatus = '';
    let emitter = this.installService.messageEmitter.subscribe((payload: any) => {
      if (payload.percentComplete != -1) {
        this.percentComplete = payload.percentComplete;
      }
      this.installationStatus += '\n' + payload.message;
    });

    this.installService.install().subscribe((env) => {
      this.ngZone.run(() => {
        this.currentEnvironment = env;
        this.installing = false;
        this.installationStatus = null;
        emitter.unsubscribe();

        let installInfo = this.currentEnvironment.installInfo;
        if (installInfo && installInfo.installed) {
          // goto login tab
          let redirect = this.auth.redirectUrl || '';
          this.router.navigate([redirect]);
        } else {
          // go to install hub tab
          this.loginUi.gotoTab('Installer');
        }
      })
    });
  }

  unInstall() {
    this.uninstalling = true;

    this.installationStatus = '';
    let emitter = this.installService.messageEmitter.subscribe((payload: any) => {
      this.percentComplete = payload.percentComplete;
      this.installationStatus += '\n' + payload.message;
    });

    this.installService.uninstall().subscribe((env) => {
      this.currentEnvironment = env;
      setTimeout(() => {
        this.uninstalling = false;
        this.installationStatus = null;
      }, 1000);
      emitter.unsubscribe();

      let installInfo = this.currentEnvironment.installInfo;
      if (installInfo && installInfo.installed) {
        // goto login tab
        let redirect = this.auth.redirectUrl || '';
        this.router.navigate([redirect]);
      } else {
        // go to install hub tab
        this.loginUi.gotoTab('Installer');
      }
    });
  }

  installNext() {
    this.router.navigate(['']);
  }

  folderClicked(folders: any): void {
    this.folder = folders.absolutePath;
  }

  canProjectNext() {
    return (this.showFolderBrowser && this.folder) ||
      (!this.showFolderBrowser && this.project);
  }

  chooseProject() {
    if (this.showFolderBrowser && this.folder) {
      // create a new project
      this.projectService.addProject(this.folder).subscribe(this.gotProject);
    } else if (!this.showFolderBrowser && this.project) {
      // select the project
      this.projectService.getProject(this.project).subscribe(this.gotProject);
    }
  }

  removeProject(project: any) {
    this.projectService.removeProject(project).subscribe(() => {
      _.remove(this.projects, p => {
        return p.id === project.id;
      });
      if (this.projects.length === 0) {
        this.showFolderBrowser = true;
      }
    });
  }

  gotProject = (project: any) => {
    this.currentProject = project;
    this.loginInfo.projectId = project.id;
    if (project.initialized) {
      // go straight to the environment choose
      this.loginUi.gotoTab('Environment');
    } else {
      this.projectService.getProjectDefaults(this.currentProject.id).subscribe(defaults => {
        this.defaultSettings = defaults;
        _.merge(this.initSettings, _.clone(defaults));
        // go to the init project tab
        this.loginUi.gotoTab('InitIfNeeded');
      });
    }
  };

  restoreInitDefaults() {
    this.dialogService.confirm('Really restore the default settings?', 'Cancel', 'Restore').subscribe(() => {
        this.initSettings = _.clone(this.defaultSettings);
      },
      () => {
      });
  }

  gotEnvironment(environment: string) {
    this.loginInfo.environment = environment;
    this.currentEnvironmentString = environment;
  }

  loginNext() {
    this.loginUi.gotoTab('InstalledCheck');
    this.projectService.getProjectEnvironment().subscribe((env: any) => {
      this.currentEnvironment = env;

      let installInfo = this.currentEnvironment.installInfo;

      if (installInfo && installInfo.installed) {
        if (this.currentEnvironment.runningVersion !== '0.1.2' &&
          this.currentEnvironment.runningVersion !== '%%mlHubVersion%%' &&
          this.currentEnvironment.installedVersion !== '%%mlHubVersion%%' &&
          (SemVer.gt(this.currentEnvironment.runningVersion, this.currentEnvironment.installedVersion)
            || this.currentEnvironment.runningVersion !== this.currentEnvironment.dhfversion)) {
          this.loginUi.gotoTab('RequiresUpdate');
        } else {
          // goto login tab
          let redirect = this.auth.redirectUrl || '';
          this.router.navigate([redirect]);
        }
      } else {
        this.doPreinstallCheck();
      }
    });
  }

  doPreinstallCheck() {
    this.loginUi.gotoTab('PreInstallCheck');
    this.runningPreinstallCheck = true;
    this.projectService.preinstallCheck().subscribe((resp: any) => {
        this.runningPreinstallCheck = false;
        this.preinstallCheck = resp;
        if (this.preinstallCheck.safeToInstall) {
          this.loginUi.gotoTab('Installer');
        } else {
          console.log('bad!');
        }
      },
      () => {
        this.runningPreinstallCheck = false;
        this.preinstallCheck = null;
      });
  }

  initProject() {
    this.projectService.initProject(
      this.currentProject.id,
      this.initSettings
    ).subscribe((project: any) => {
      this.currentProject = project;
      this.loginInfo.projectId = project.id;
      this.loginUi.gotoTab('PostInit');
    });
  }

  updateProject() {
    this.hubUpdating = true;
    this.projectService.updateProject().subscribe(() => {
        this.hubUpdating = false;
        this.hubUpdateError = '';
        this.loginNext();
      },
      error => {
        this.hubUpdating = false;
        this.hubUpdateFailed = true;
        this.hubUpdateError = error.json().message;
      });
  }

  postInitNext() {
    this.loginUi.gotoTab('Environment');
  }

  login() {
    this.loginError = null;
    this.loggingIn = true;
    this.projectService.login(
      this.currentProject.id,
      this.currentEnvironmentString,
      this.loginInfo
    ).subscribe(() => {
        this.auth.setAuthenticated(true);
        this.loginNext();
        this.loginError = null;
        this.loggingIn = false;
      },
      error => {
        let errorMsg = error;
        try {
          errorMsg = error.json().message;
        } catch (e) {
          //not valid json, so we suppress error and report it straight
        }
        this.loginError = errorMsg;
        console.log(error);
        this.auth.setAuthenticated(false);
        this.loggingIn = false;
      });
  }

  hubNameChanged() {
    const name = this.initSettings.name;
    this.initSettings.stagingHttpName = name + '-STAGING';
    this.initSettings.stagingDbName = name + '-STAGING';
    this.initSettings.stagingTriggersDbName = name + '-staging-TRIGGERS';
    this.initSettings.stagingSchemasDbName = name + '-staging-SCHEMAS';
    this.initSettings.finalHttpName = name + '-FINAL';
    this.initSettings.finalDbName = name + '-FINAL';
    this.initSettings.finalTriggersDbName = name + '-final-TRIGGERS';
    this.initSettings.finalSchemasDbName = name + '-final-SCHEMAS';
    this.initSettings.traceHttpName = name + '-JOBS';
    this.initSettings.traceDbName = name + '-JOBS';
    this.initSettings.jobHttpName = name + '-JOBS';
    this.initSettings.jobDbName = name + '-JOBS';
    this.initSettings.modulesDbName = name + '-MODULES';
  }

  hubUpdateUrl() {
    if (this.currentEnvironment && this.currentEnvironment.runningVersion) {
      const versionString = this.currentEnvironment.runningVersion.replace(/\./g, '');
      return `https://marklogic.github.io/marklogic-data-hub/upgrade/`;
    }
    return '';
  }
}
