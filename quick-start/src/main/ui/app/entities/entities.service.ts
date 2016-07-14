import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { AuthService } from '../auth/auth.service';
import { Message } from 'stompjs/lib/stomp.min';
import { STOMPService } from '../stomp/stomp.service';

@Injectable()
export class EntitiesService {
  mlcpMessageEmitter: EventEmitter<string> = new EventEmitter<string>();
  entityMessageEmitter: EventEmitter<string> = new EventEmitter<string>();

  private messages: Observable<Message>;
  private stompIds: any = {
    entities: null,
    mlcp: null
  };

  constructor(
    private http: Http,
    private auth: AuthService,
    private stomp: STOMPService
  ) {
    this.stomp.configure('/websocket');
    this.stomp.try_connect();
    this.stomp.messages.subscribe(this.onWebsockMessage);
  }

  subscribeToEntities() {
    if (!this.stompIds.entities) {
      this.stompIds.entities = this.stomp.subscribe('/topic/entity-status');
    }
  }

  getEntities() {
    this.subscribeToEntities();
    return this.get('/entities/');
  }

  getEntity(entityName) {
    return this.get(`/entities/${entityName}`);
  }

  createEntity(entity) {
    return this.post('/entities/', entity);
  }

  createFlow(entity, flowType, flow) {
    return this.post(`/entities/${entity.entityName}/flows/${flowType}`, flow);
  }

  getInputFlowOptions(flow) {
    return this.get(`/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`);
  }

  runInputFlow(flow, mlcpOptions) {
    if (!this.stompIds.mlcp) {
      this.stompIds.mlcp = this.stomp.subscribe('/topic/mlcp-status');
    }

    const url = `/entities/${flow.entityName}/flows/INPUT/${flow.flowName}/run/input`;
    return this.post(url, mlcpOptions).subscribe(() => {});
  }

  runHarmonizeFlow(flow) {
    const url = `/entities/${flow.entityName}/flows/HARMONIZE/${flow.flowName}/run`;
    return this.post(url, null).subscribe(() => {});
  }

  public extractData = (res: Response) => {
    if (!this.auth.isAuthenticated()) {
      this.auth.setAuthenticated(true);
    }
    return res.json();
  }

  public onWebsockMessage = (message: Message) => {
    let json = JSON.parse(message.body);
    if (message.headers.destination === '/topic/mlcp-status') {
      this.onMlcpMessage(json);
    } else if (message.headers.destination === '/topic/entity-status') {
      this.onEntityMessage(json.message);
    }
  }

  private onMlcpMessage(json) {
    this.mlcpMessageEmitter.next(json);

    if (json.percentComplete === 100) {
      if (this.stompIds.mlcp) {
        this.stomp.unsubscribe(this.stompIds.mlcp);
      }
    }
  }

  private onEntityMessage(path) {
    this.entityMessageEmitter.next(path);
  }

  private get(url) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url, data) {
    return this.http.post(url, data).map(this.extractData);
  }
}
