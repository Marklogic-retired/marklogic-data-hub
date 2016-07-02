import {Component, Input, Inject} from 'ng-forward';
import * as _ from 'lodash';

import jQuery from 'jquery';

import {ProjectService} from '../../services/projectService';
import {InstallService} from '../../services/installService';

import {FolderBrowser} from '../folder-browser/folder-browser.js';
import {SelectList} from '../select-list/select-list';

import template from './login.html';
import './login.scss';

@Component({
  selector: 'login',
  template,
  directives: [FolderBrowser, SelectList],
  providers: [ProjectService, InstallService],
})
@Inject('$element', '$scope', '$rootScope', '$timeout', '$state', '$mdDialog', ProjectService, InstallService)
/**
 * @ngdoc directive
 * @name login
 * @restrict E
 *
 * @param message
 */
export class Login {
  initSettings = null;

  visitedTabs = [];

  tabs = {
    ProjectDir: 0,
    InitIfNeeded: 1,
    Environment: 2,
    Login: 3,
    InstalledCheck: 4,
    Installer: 5,
  };

  progressHidden = false;

  tabIndex = 0;

  environments = ['local', 'dev', 'qa', 'prod'];

  showFolderBrowser = false;

  constructor($element, $scope, $rootScope, $timeout, $state, $mdDialog, projectService, installService) {
    this.$element = $element;
    this.$scope = $scope;
    this.$timeout = $timeout;
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.projectService = projectService;
    this.installService = installService;
    this.message = '';

    $rootScope._authenticated = false;

    projectService.getProjects().then(resp => {
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
      // this.lastProject = resp.lastProject || null;
    });
  }

  install() {
    this.progressHidden = false;

    this.installService.messageEmitter.subscribe((payload) => {
      this.percentComplete = payload.percentComplete;
      this.message += '\n' + payload.message;
      this.$scope.$apply();
      const div = this.$element.find('section')[0];
      div.scrollTop = div.scrollHeight;

      if (this.percentComplete === 100) {
        this.$timeout(() => {
          this.progressHidden = true;
        }, 1000);
      }
    });
    this.installService.install();
  }

  folderClicked(event) {
    this.folder = event.detail;
  }

  back() {
    if (this.visitedTabs.length > 0) {
      this.tabIndex = this.visitedTabs.pop();
    }
  }

  gotoTab(tabName) {
    const idx = this.tabs[tabName];
    this.visitedTabs.push(this.tabIndex);
    this.tabIndex = idx;
  }

  canProjectNext() {
    return (this.showFolderBrowser && this.folder) ||
      (!this.showFolderBrowser && this.project);
  }

  chooseProject() {
    const bound = this.gotProject.bind(this);
    if (this.showFolderBrowser && this.folder) {
      // create a new project
      this.projectService.addProject(this.folder).then(bound);
    } else if (!this.showFolderBrowser && this.project) {
      // select the project
      this.projectService.getProject(this.project).then(bound);
    }
  }

  gotProject(project) {
    this.currentProject = project;
    if (project.initialized) {
      // go straight to the environment choose
      this.gotoTab('Environment');
    } else {
      this.projectService.getProjectDefaults(this.currentProject.id).then(defaults => {
        this.defaultSettings = defaults;
        this.initSettings = _.clone(defaults);
        // go to the init project tab
        this.gotoTab('InitIfNeeded');
      });
    }
  }

  restoreInitDefaults() {
    const confirm = this.$mdDialog.confirm()
          .title('Are you sure?')
          .textContent('Really restore the default settings?')
          .ok('Restore')
          .cancel('Cancel');
    this.$mdDialog.show(confirm).then(() => {
      this.initSettings = _.clone(this.defaultSettings);
    });
  }

  gotEnvironment(environment) {
    this.currentEnvironmentString = environment;
  }

  environmentNext() {
    this.gotoTab('Login');
    this.$timeout(() => {
      const username = jQuery('#username');
      username.focus();
    }, 1000);
  }

  loginNext() {
    this.gotoTab('InstalledCheck');

    this.projectService.getProjectEnvironment(this.currentProject.id, this.currentEnvironmentString).then(env => {
      this.currentEnvironment = env;

      if (this.currentEnvironment.installed) {
        // goto login tab
        this.$state.go('home');
      } else {
        // go to install hub tab
        this.gotoTab('Installer');
      }
    });
  }

  initProject() {
    this.projectService.initProject(this.currentProject.id, this.initSettings).then(project => {
      this.currentProject = project;
      this.gotoTab('Environment');
    });
  }

  login() {
    this.projectService.login(
      this.currentProject.id,
      this.currentEnvironmentString,
      this.loginInfo).then(() => {
        this.loginNext();
      });
  }
}
