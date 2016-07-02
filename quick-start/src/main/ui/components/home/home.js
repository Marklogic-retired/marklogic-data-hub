import {Component, Input, Inject} from 'ng-forward';

import angular from 'angular';

import {EntitiesService} from '../../services/entitiesService';

import {NewEntity} from '../new-entity/new-entity';
import {NewFlow} from '../new-flow/new-flow';
import {MlcpUi} from '../mlcp-ui/mlcp-ui';

import newEntityTemplate from '../new-entity/new-entity.html';
import newFlowTemplate from '../new-flow/new-flow.html';
import mlcpUiTemplate from '../mlcp-ui/mlcp-ui.html';
import template from './home.html';

import './home.scss';
import '../new-entity/new-entity.scss';
import '../mlcp-ui/mlcp-ui.scss';
import '../new-flow/new-flow.scss';

@Component({
  selector: 'home',
  template,
  providers: [EntitiesService, NewEntity, NewFlow, MlcpUi],
})
@Inject('$rootScope', '$state', '$mdDialog', EntitiesService)
/**
 * @ngdoc directive
 * @name home
 * @restrict E
 *
 * @param message
 */
export class Home {
  constructor($rootScope, $state, $mdDialog, entitiesService) {
    this.$state = $state;
    this.$mdDialog = $mdDialog;
    this.entitiesService = entitiesService;

    $rootScope._authenticated = true;

    this.entitiesService.getEntities().then(entities => {
      this.entities = entities;
      if (this.entities.length > 0) {
        this.setEntity(this.entities[0]);
      }
    }).catch(error => {
      if (error.status === 401) {
        this.$state.go('login');
      }
    });
  }

  setEntity(entity) {
    this.entity = entity;
  }

  isActiveEntity(entity) {
    if (this.entity === entity) {
      return 'active';
    }
    return '';
  }

  cancelDialog() {
    this.$mdDialog.cancel();
  }

  newEntity(ev) {
    this.$mdDialog.show({
      controller: NewEntity,
      template: newEntityTemplate,
      controllerAs: 'ctrl',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      fullscreen: true,
    })
    .then(newEntity => {
      this.entitiesService.createEntity(newEntity).then(entity => {
        this.entities.push(entity);
      });
    });
  }

  newInputFlow(ev) {
    return this.newFlow(ev, 'INPUT');
  }

  newHarmonizeFlow(ev) {
    return this.newFlow(ev, 'HARMONIZE');
  }

  newFlow(ev, flowType) {
    this.$mdDialog.show({
      controller: NewFlow,
      template: newFlowTemplate,
      controllerAs: 'ctrl',
      parent: angular.element(document.body),
      targetEvent: ev,
      clickOutsideToClose: false,
      fullscreen: true,
      locals: {
        flowType: flowType,
      },
    })
    .then(newFlow => {
      this.entitiesService.createFlow(this.entity, flowType, newFlow).then(flow => {
        if (flowType === 'INPUT') {
          this.entity.inputFlows.push(flow);
        } else if (flowType === 'HARMONIZE') {
          this.entity.harmonizeFlows.push(flow);
        }
      });
    });
  }

  runInputFlow(ev, flow) {
    this.entitiesService.getInputFlowOptions(flow).then(mlcpOptions => {
      this.$mdDialog.show({
        controller: MlcpUi,
        template: mlcpUiTemplate,
        controllerAs: 'ctrl',
        parent: angular.element('dlg-holder'),
        targetEvent: ev,
        clickOutsideToClose: false,
        fullscreen: true,
        locals: {
          flow: flow,
          mlcpOptions: mlcpOptions,
        },
      })
      .then(options => {
        console.log(options);
        this.entitiesService.runInputFlow(flow, options);
      });
    });
  }

  runHarmonizeFlow(flow) {
    this.entitiesService.runHarmonizeFlow(flow);
  }
}
