import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';
import { FlowStatus } from '../entities/flow-status.model';
import { ProjectService } from '../projects/projects.service';
import * as moment from 'moment';

@Injectable()
export class DeployService {
  public errors: any = {};
  public onDeploy: EventEmitter<string> = new EventEmitter<string>();

  private _lastDeployed: any;
  private projectId: string;
  private environment: string;

  constructor(
    private http: Http,
    private stomp: STOMPService,
    private projectService: ProjectService
  ) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/deploy-status');
    this.stomp.subscribe('/topic/validate-status');
    this.projectId = projectService.projectId;
    this.environment = projectService.environment;
    this.updateLastDeployed();
  }

  public getLastDeployed() {
    return this._lastDeployed;
  }

  public validateUserModules() {
    const url = `/projects/${this.projectId}/${this.environment}/validate-user-modules`;
    this.http.post(url, '').subscribe(() => {});
  }

  public redeployUserModules() {
    const url = `/projects/${this.projectId}/${this.environment}/reinstall-user-modules`;
    return this.http.post(url, '');
  }

  private updateLastDeployed() {
    const url = `/projects/${this.projectId}/${this.environment}/last-deployed`;
    this.http.get(url).map((res: Response) => { return res.json(); }).subscribe((resp: any) => {
      this._lastDeployed = moment(resp.lastModified);
    });
  }

  private onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/validate-status') {
      let status: any = JSON.parse(message.body);
      this.errors = status.errors;
    } else if (message.headers.destination === '/topic/deploy-status') {
      let status: any = JSON.parse(message.body);
      this._lastDeployed = moment(status.lastModified);
      this.onDeploy.emit(status);
    }
  }
}
