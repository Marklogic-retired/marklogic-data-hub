import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp';
import { ProjectService } from '../projects';
import { parse } from 'date-fns';
import {map} from 'rxjs/operators';

@Injectable()
export class DeployService {
  public errors: any = {};
  public onDeploy: EventEmitter<string> = new EventEmitter<string>();

  private _lastDeployed: any;

  private validateSubscribed: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(
    private http: Http,
    private stomp: STOMPService,
    private projectService: ProjectService
  ) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/deploy-status').then(() => {
      this.stomp.subscribe('/topic/validate-status').then(() => {
        this.validateSubscribed.emit(true);
      });
    });
    this.updateLastDeployed();
  }

  public getLastDeployed() {
    return this._lastDeployed;
  }

  public validateUserModules() {
    this.validateSubscribed.subscribe(() => {
      const url = `/api/current-project/validate-user-modules`;
      this.http.post(url, '').subscribe(() => {});
    });
  }

  public redeployUserModules() {
    const url = `/api/current-project/reinstall-user-modules`;
    return this.http.post(url, '');
  }

  private updateLastDeployed() {
    const url = `/api/current-project/last-deployed`;
    this.http.get(url).pipe(map((res: Response) => { return res.json(); })).subscribe((resp: any) => {
      this._lastDeployed = (resp.deployed) ? parse(resp.lastModified) : null;
    });
  }

  private onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/validate-status') {
      let status: any = JSON.parse(message.body);
      this.errors = status.errors;
    } else if (message.headers.destination === '/topic/deploy-status') {
      let status: any = JSON.parse(message.body);
      this._lastDeployed = (status.deployed) ? parse(status.lastModified) : null;
      this.onDeploy.emit(status);
    }
  }
}
