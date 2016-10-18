import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';
import { ProjectService } from '../projects/projects.service';
import * as moment from 'moment';

@Injectable()
export class DeployService {
  public errors: any = {};
  public onDeploy: EventEmitter<string> = new EventEmitter<string>();

  private _lastDeployed: any;

  constructor(
    private http: Http,
    private stomp: STOMPService,
    private projectService: ProjectService
  ) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/deploy-status');
    this.stomp.subscribe('/topic/validate-status');
    this.updateLastDeployed();
  }

  public getLastDeployed() {
    return this._lastDeployed;
  }

  public validateUserModules() {
    const url = `/api/projects/${this.projectService.projectId}/${this.projectService.environment}/validate-user-modules`;
    this.http.post(url, '').subscribe(() => {});
  }

  public redeployUserModules() {
    const url = `/api/projects/${this.projectService.projectId}/${this.projectService.environment}/reinstall-user-modules`;
    return this.http.post(url, '');
  }

  private updateLastDeployed() {
    const url = `/api/projects/${this.projectService.projectId}/${this.projectService.environment}/last-deployed`;
    this.http.get(url).map((res: Response) => { return res.json(); }).subscribe((resp: any) => {
      this._lastDeployed = (resp.deployed) ? moment(resp.lastModified) : null;
    });
  }

  private onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/validate-status') {
      let status: any = JSON.parse(message.body);
      this.errors = status.errors;
    } else if (message.headers.destination === '/topic/deploy-status') {
      let status: any = JSON.parse(message.body);
      this._lastDeployed = (resp.deployed) ? moment(resp.lastModified) : null;
      this.onDeploy.emit(status);
    }
  }
}
