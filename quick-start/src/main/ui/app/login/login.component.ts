import { Component, Input, Renderer } from '@angular/core';
import { Router } from '@angular/router';

import * as _ from 'lodash';

import { AuthService } from '../auth/auth.service';
import { ProjectService } from '../projects/projects.service';
import { InstallService } from '../installer/index';
import { ConfirmService } from '../confirm/index';
import { FolderBrowser } from '../folder-browser/folder-browser.component';
import { SelectList } from '../select-list/select-list.component';
import { LoginInfo } from './login-info.model';
import { HubSettings } from '../environment/hub-settings.model';

@Component({
  selector: 'login',
  templateUrl: './login.template.html',
  directives: [
    FolderBrowser,
    SelectList
  ],
  providers: [],
  styleUrls: ['./login.style.css']
})

export class Login {
  defaultSettings: HubSettings;
  initSettings: HubSettings = new HubSettings();
  showInitAdvanced: boolean = false;

  currentTab: string = 'ProjectDir';

  visitedTabs: Array<string> = [];

  loginError: boolean = false;
  loggingIn: boolean = false;

  tabs: any = {
    ProjectDir: true,
    InitIfNeeded: false,
    PostInit: false,
    Environment: false,
    Login: false,
    InstalledCheck: false,
    Installer: false,
  };


  installing: boolean = false;

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
    private confirm: ConfirmService,
    private router: Router,
    private renderer: Renderer) {

    projectService.getProjects().subscribe(resp => {
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

      if (this.percentComplete === 100) {
        setTimeout(() => {
          this.installing = false;
        }, 1000);
        this.currentEnvironment.installed = true;
        emitter.unsubscribe();
      }
    });
    this.installService.install(
      this.currentProject.id,
      this.currentEnvironmentString);
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
    const event = $event.event;
    this.confirm.showConfirm({
      title: 'Remove Project?',
      message: 'Remove the project from the list of projects? Does not destroy anything on disk.',
      okText: 'Remove',
      cancelText: 'Cancel'
    }, event).then(() => {
      this.projectService.removeProject(project).subscribe(() => {
        _.remove(this.projects, p => { return p.id === project.id; });
        if (this.projects.length === 0) {
          this.showFolderBrowser = true;
        }
      });
    }).catch(() => {});
  }

  gotProject = (project: any) => {
    this.currentProject = project;
    if (project.initialized) {
      // go straight to the environment choose
      this.gotoTab('Environment');
    } else {
      this.projectService.getProjectDefaults(this.currentProject.id).subscribe(defaults => {
        this.defaultSettings = defaults;
        this.initSettings = _.clone(defaults);
        // go to the init project tab
        this.gotoTab('InitIfNeeded');
      });
    }
  }

  restoreInitDefaults($evt: MouseEvent) {
    this.confirm.showConfirm({
      title: 'Are you sure?',
      message: 'Really restore the default settings?',
      okText: 'Restore',
      cancelText: 'Cancel'
    }, $evt).then(() => {
      this.initSettings = _.clone(this.defaultSettings);
    }).catch(() => {});
  }

  gotEnvironment(environment: string) {
    this.currentEnvironmentString = environment;
  }

  environmentNext() {
    this.gotoTab('Login');
    setTimeout(() => {
      this.renderer.invokeElementMethod(
        this.renderer.selectRootElement('input#username-input'), 'focus');
    }, 500);
  }

  loginNext() {
    this.gotoTab('InstalledCheck');

    this.projectService.getProjectEnvironment(
      this.currentProject.id,
      this.currentEnvironmentString).subscribe(env => {
      this.currentEnvironment = env;

      if (this.currentEnvironment.installed) {
        // goto login tab
        let redirect = this.auth.redirectUrl || '';
        this.router.navigate([redirect]);
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
      this.gotoTab('PostInit');
    });
  }

  postInitNext() {
    this.gotoTab('Environment');
  }

  login() {
    this.loginError = false;
    this.loggingIn = true;
    this.projectService.login(
      this.currentProject.id,
      this.currentEnvironmentString,
      this.loginInfo
    ).subscribe(() => {
        this.auth.setAuthenticated(true);
        this.loginNext();
        this.loginError = false;
        this.loggingIn = false;
      },
      error => {
        this.loginError = true;
        console.log('login failed!');
        this.auth.setAuthenticated(false);
        this.loggingIn = false;
      });
  }

  private hubNameChanged() {
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

  private disableTabs() {
    _.each(this.tabs, (tab, key) => {
      this.tabs[key] = false;
    });
  }
}
