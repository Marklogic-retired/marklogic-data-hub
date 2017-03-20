import { Component, Renderer, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { InstallService } from '../installer';
import { LoginInfo } from './login-info.model';
import { HubSettings } from '../environment/hub-settings.model';
import { MdlDialogService } from 'angular2-mdl';

import * as SemVer from 'semver';

@Component({
  selector: 'app-login',
  templateUrl: './login.template.html',
  providers: [],
  styleUrls: ['./login.style.scss']
})

export class LoginComponent implements OnInit {
  defaultSettings: HubSettings;
  initSettings: HubSettings = new HubSettings();
  showInitAdvanced: boolean = false;

  hubVersions: any;
  hubUpdating: boolean = false;
  hubUpdateFailed: boolean = false;

  currentTab: string = 'ProjectDir';

  visitedTabs: Array<string> = [];

  loginError: string = null;
  loggingIn: boolean = false;

  tabs: any = {
    ProjectDir: true,
    InitIfNeeded: false,
    PostInit: false,
    Environment: false,
    Login: false,
    InstalledCheck: false,
    Installer: false,
    RequiresUpdate: false
  };


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

  loginInfo: LoginInfo = new LoginInfo();

  constructor(
    private auth: AuthService,
    private projectService: ProjectService,
    private installService: InstallService,
    private dialogService: MdlDialogService,
    private router: Router,
    private renderer: Renderer) {}

  ngOnInit() {
    this.projectService.getProjects().subscribe(resp => {
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
      this.percentComplete = payload.percentComplete;
      this.installationStatus += '\n' + payload.message;
    });

    this.installService.install().subscribe((env) => {
      this.currentEnvironment = env;
      setTimeout(() => {
        this.installing = false;
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
        this.gotoTab('Installer');
      }
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
        this.gotoTab('Installer');
      }
    });
  }

  installNext() {
    this.router.navigate(['']);
  }

  folderClicked(folder: string): void {
    this.folder = folder;
  }

  back() {
    if (this.visitedTabs.length > 0) {
      this.disableTabs();
      this.currentTab = this.visitedTabs.pop();
      this.tabs[this.currentTab] = true;
    }
  }

  gotoTab(tabName: string): void {
    this.disableTabs();
    this.tabs[tabName] = true;

    const skipUs = ['InstalledCheck', 'InitIfNeeded', 'PostInit'];
    if (skipUs.indexOf(this.currentTab) < 0) {
      this.visitedTabs.push(this.currentTab);
    }
    this.currentTab = tabName;
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

  removeProject($event: any) {
    const project = $event.item;
    this.projectService.removeProject(project).subscribe(() => {
      _.remove(this.projects, p => { return p.id === project.id; });
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
      this.gotoTab('Environment');
    } else {
      this.projectService.getProjectDefaults(this.currentProject.id).subscribe(defaults => {
        this.defaultSettings = defaults;
        _.merge(this.initSettings, _.clone(defaults));
        // go to the init project tab
        this.gotoTab('InitIfNeeded');
      });
    }
  }

  restoreInitDefaults($evt: MouseEvent) {
    this.dialogService.confirm('Really restore the default settings?', 'Cancel', 'Restore').subscribe(() => {
    this.initSettings = _.clone(this.defaultSettings);
    },
    () => {});
  }

  gotEnvironment(environment: string) {
    this.loginInfo.environment = environment;
    this.currentEnvironmentString = environment;
  }

  environmentNext() {
    this.gotoTab('Login');
    setTimeout(() => {
      this.renderer.invokeElementMethod(
        this.renderer.selectRootElement('input#username'), 'focus');
    }, 500);
  }

  loginNext() {
    this.gotoTab('InstalledCheck');
    this.projectService.getProjectEnvironment().subscribe((env: any) => {
      this.currentEnvironment = env;

      let installInfo = this.currentEnvironment.installInfo;

      if (installInfo && installInfo.installed) {
        if (SemVer.gt(this.currentEnvironment.runningVersion, this.currentEnvironment.installedVersion)) {
          this.gotoTab('RequiresUpdate');
        } else {
          // goto login tab
          let redirect = this.auth.redirectUrl || '';
          this.router.navigate([redirect]);
        }
      } else {
        // go to install hub tab
        this.gotoTab('Installer');
      }
    });
  }

  initProject() {
    this.projectService.initProject(
      this.currentProject.id,
      this.initSettings
    ).subscribe((project: any) => {
      this.currentProject = project;
      this.loginInfo.projectId = project.id;
      this.gotoTab('PostInit');
    });
  }

  updateProject() {
    this.hubUpdating = true;
    this.projectService.updateProject().subscribe(() => {
      this.hubUpdating = false;
      this.loginNext();
    },
    () => {
      this.hubUpdating = false;
      this.hubUpdateFailed = true;
    });
  }

  postInitNext() {
    this.gotoTab('Environment');
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
        this.loginError = error.json().message;
        this.auth.setAuthenticated(false);
        this.loggingIn = false;
      });
  }

  hubNameChanged() {
    const name = this.initSettings.name;
    this.initSettings.stagingHttpName = name + '-STAGING';
    this.initSettings.stagingDbName = name + '-STAGING';
    this.initSettings.finalHttpName = name + '-FINAL';
    this.initSettings.finalDbName = name + '-FINAL';
    this.initSettings.traceHttpName = name + '-TRACING';
    this.initSettings.traceDbName = name + '-TRACING';
    this.initSettings.jobHttpName = name + '-JOBS';
    this.initSettings.jobDbName = name + '-JOBS';
    this.initSettings.modulesDbName = name + '-MODULES';
    this.initSettings.triggersDbName = name + '-TRIGGERS';
    this.initSettings.schemasDbName = name + '-SCHEMAS';
  }

  hubUpdateUrl() {
    if (this.currentEnvironment && this.currentEnvironment.runningVersion) {
      const versionString = this.currentEnvironment.runningVersion.replace(/\./g, '');
      return `https://github.com/marklogic/marklogic-data-hub/wiki/Updating-to-a-New-Hub-Version#${versionString}`;
    }
    return '';
  }

  getInstalledIcon(isTrue: boolean) {
    return isTrue ? 'fa-check' : 'fa-close';
  }

  private disableTabs() {
    _.each(this.tabs, (tab, key) => {
      this.tabs[key] = false;
    });
  }
}
