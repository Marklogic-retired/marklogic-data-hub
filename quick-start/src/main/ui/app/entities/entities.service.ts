import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';
import { ProjectService } from '../projects/projects.service';

import { Entity } from './entity.model';
import { Flow } from './flow.model';

@Injectable()
export class EntitiesService {
  entityMessageEmitter: EventEmitter<string> = new EventEmitter<string>();

  private stompIds: any = {
    entities: null,
  };

  private projectId: string;
  private environment: string;

  constructor(
    private http: Http,
    private stomp: STOMPService,
    private projectService: ProjectService
  ) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.projectId = projectService.projectId;
    this.environment = projectService.environment;
  }

  subscribeToEntities() {
    if (!this.stompIds.entities) {
      this.stompIds.entities = this.stomp.subscribe('/topic/entity-status');
    }
  }

  getEntities() {
    this.subscribeToEntities();
    return this.get(this.url('/entities/'));
  }

  getEntity(entityName: string) {
    return this.get(this.url(`/entities/${entityName}`));
  }

  createEntity(entity: Entity) {
    return this.post(this.url('/entities/'), entity);
  }

  createFlow(entity: Entity, flowType, flow: Flow) {
    return this.post(this.url(`/entities/${entity.entityName}/flows/${flowType}`), flow);
  }

  getInputFlowOptions(flow: Flow) {
    const url = this.url(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`);
    return this.get(url);
  }

  saveInputFlowOptions(flow: Flow, mlcpOptions) {
    const url = this.url(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/save-input-options`);
    return this.http.post(url, mlcpOptions);
  }

  runInputFlow(flow: Flow, mlcpOptions) {
    const url = this.url(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`);
    return this.post(url, mlcpOptions).subscribe(() => {});
  }

  runHarmonizeFlow(flow: Flow) {
    const url = this.url(`/entities/${flow.entityName}/flows/HARMONIZE/${flow.flowName}/run`);
    return this.post(url, '').subscribe(() => {});
  }

  public extractData = (res: Response) => {
    return res.json();
  }

  public onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/entity-status') {
      let json = JSON.parse(message.body);
      this.entityMessageEmitter.next(json.message);
    }
  }

  private get(url: string) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url: string, data) {
    return this.http.post(url, data).map(this.extractData);
  }

  private url(u: string): string {
    return `/projects/${this.projectId}/${this.environment}${u}`;
  }
}
