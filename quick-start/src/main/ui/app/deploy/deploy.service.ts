import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';
import { FlowStatus } from '../entities/flow-status.model';
import { ProjectService } from '../projects/projects.service';

@Injectable()
export class DeployService {
  public errors: any = {};

  private projectId: string;
  private environment: string;

  constructor(
    private http: Http,
    private stomp: STOMPService,
    private projectService: ProjectService
  ) {
    this.stomp.messages.subscribe(this.onWebsockMessage);
    this.stomp.subscribe('/topic/validate-status');
    this.projectId = projectService.projectId;
    this.environment = projectService.environment;
  }

  public validateUserModules() {
    const url = `/projects/${this.projectId}/${this.environment}/validate-user-modules`;
    this.http.post(url, '').subscribe(() => {});
  }

  private onWebsockMessage = (message: Message) => {
    if (message.headers.destination === '/topic/validate-status') {
      let status: any = JSON.parse(message.body);
      console.log(status);
      this.errors = status.errors;
    }
  }
}
